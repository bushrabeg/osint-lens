import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

const DAILY_LIMIT = 3;

// Returns remaining count after increment, or -1 if already over limit.
async function incrementRateLimit(ip) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `rl:${ip}:${today}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 86400);
  }
  return count; // caller checks count > DAILY_LIMIT
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, stream, temperature, max_tokens, tools, tool_choice, userApiKey } = req.body;

  // If user supplies their own key, bypass rate limiting entirely.
  const useUserKey = userApiKey && userApiKey.length > 10;
  const openRouterKey = useUserKey ? userApiKey : process.env.OPENROUTER_API_KEY;

  if (!useUserKey) {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || req.socket?.remoteAddress
      || 'unknown';

    let count;
    try {
      count = await incrementRateLimit(ip);
    } catch (e) {
      // KV unavailable — fail open (allow request) to avoid blocking all users
      console.error('KV rate limit error:', e.message);
      count = 0;
    }

    if (count > DAILY_LIMIT) {
      return res.status(429).json({
        error:
          'Günlük 3 ücretsiz analizinizi kullandınız.\n' +
          'Devam etmek için OpenRouter API key ekleyin.',
        limitReached: true
      });
    }
  }

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
        'Authorization': 'Bearer ' + openRouterKey,
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
