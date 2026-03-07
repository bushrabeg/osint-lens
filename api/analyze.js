export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, stream, temperature, max_tokens, tools, tool_choice, userApiKey } = req.body;

  const apiKey = (userApiKey && userApiKey.length > 10)
    ? userApiKey
    : process.env.OPENROUTER_API_KEY;

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
        'Authorization': 'Bearer ' + apiKey,
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
