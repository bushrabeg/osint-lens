// IP-based rate limiting (in-memory; resets on cold start)
// For persistent limits across instances, use Vercel KV.
const rateLimitMap = new Map();
const DAILY_LIMIT = 3;

function checkRateLimit(ip) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = ip + ':' + today;
  const count = rateLimitMap.get(key) || 0;
  if (count >= DAILY_LIMIT) return false;
  // Prune stale keys from previous days
  for (const [k] of rateLimitMap) {
    if (!k.endsWith(':' + today)) rateLimitMap.delete(k);
  }
  rateLimitMap.set(key, count + 1);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Günlük analiz limitinize (3) ulaştınız. Yarın tekrar deneyin.'
    });
  }

  const { messages, stream, temperature, max_tokens, tools, tool_choice } = req.body;

  const body = {
    model: 'deepseek/deepseek-r1',
    messages,
    temperature: temperature ?? 0.7,
    max_tokens: max_tokens ?? 4000,
    stream: !!stream,
  };
  if (tools) {
    body.tools = tools;
    body.tool_choice = tool_choice || 'auto';
  }

  let apiRes;
  try {
    apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://osint-lens.vercel.app',
        'X-Title': 'OSINT Lens'
      },
      body: JSON.stringify(body)
    });
  } catch (e) {
    return res.status(502).json({ error: 'OpenRouter bağlantı hatası: ' + e.message });
  }

  if (!apiRes.ok) {
    const err = await apiRes.json().catch(() => ({}));
    return res.status(apiRes.status).json({ error: err.error?.message || 'OpenRouter HTTP ' + apiRes.status });
  }

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const reader = apiRes.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
    } finally {
      res.end();
    }
  } else {
    const data = await apiRes.json();
    res.json(data);
  }
}
