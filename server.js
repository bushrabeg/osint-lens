require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// /api/serper → Serper News API
app.post('/api/serper', async (req, res) => {
  try {
    const { _apiKey, ...payload } = req.body;
    const apiKey = _apiKey || process.env.SERPER_API_KEY;
    const response = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// /api/groq → Groq Chat API
app.post('/api/groq', async (req, res) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// /api/opensky → OpenSky Network proxy + 60s cache (local dev)
const OPENSKY_MILITARY_PREFIXES = ['RCH','REACH','CNV','JAKE','PAVE','SPAR','NAVY','USAF','RRR','COMET','RFF','RSD','NATO'];
const OPENSKY_MILITARY_SQUAWKS  = ['7777','7400','7600','7700'];
let openskyCache = { data: null, ts: 0 };

app.get('/api/opensky', async (req, res) => {
  const now = Date.now();
  if (openskyCache.data && (now - openskyCache.ts) < 60_000) {
    const age = Math.round((now - openskyCache.ts) / 1000);
    console.log(`[opensky] cache hit — yaş: ${age}s, uçak: ${openskyCache.data.flights.length}`);
    return res.json(openskyCache.data);
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 'User-Agent': 'Mozilla/5.0 OSINT-Lens/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.status === 429) {
      console.warn('[opensky] 429 rate limit');
      if (openskyCache.data) return res.json({ ...openskyCache.data, cached: true });
      return res.status(429).json({ error: 'OpenSky rate limit', flights: [] });
    }
    if (!response.ok) throw new Error('OpenSky HTTP ' + response.status);
    const raw = await response.json();
    const airborne = (raw.states || []).filter(s => s[5]!=null && s[6]!=null && s[8]===false && s[7]!=null && s[7]>100);
    const sampled  = airborne.length > 250 ? airborne.sort(() => 0.5 - Math.random()).slice(0, 250) : airborne;
    const flights  = sampled.map(s => {
      const callsign = (s[1]||'').trim(), squawk = (s[14]||'').trim();
      return {
        icao24: s[0], callsign: callsign||s[0], country: s[2]||'—',
        lat: s[6], lon: s[5],
        altitude: s[7]!=null ? Math.round(s[7]) : null,
        velocity: s[9]!=null ? Math.round(s[9]*3.6) : null,
        heading:  s[10]!=null ? Math.round(s[10]) : 0,
        squawk,
        isMilitary: OPENSKY_MILITARY_PREFIXES.some(p => callsign.toUpperCase().startsWith(p)) || OPENSKY_MILITARY_SQUAWKS.includes(squawk),
      };
    });
    const result = { flights, total: airborne.length };
    openskyCache = { data: result, ts: now };
    console.log(`[opensky] taze veri — toplam havada: ${airborne.length}, döndürülen: ${flights.length}`);
    res.json(result);
  } catch (e) {
    console.error('[opensky] hata:', e.message);
    if (openskyCache.data) return res.json({ ...openskyCache.data, stale: true });
    res.status(500).json({ error: e.message, flights: [] });
  }
});

// /api/flights → OpenSky Network proxy (local dev)
app.get('/api/flights', async (req, res) => {
  const MILITARY_PREFIXES = ['RCH','REACH','CNV','JAKE','PAVE','SPAR','NAVY','USAF','RRR','COMET','RFF','RSD','NATO'];
  const MILITARY_SQUAWKS  = ['7777','7400','7600','7700'];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 'User-Agent': 'Mozilla/5.0 OSINT-Lens/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error('OpenSky HTTP ' + response.status);
    const data = await response.json();
    console.log('[flights] OpenSky ham veri:', data.states?.length ?? 'null', 'uçak');
    const airborne = (data.states || []).filter(s => s[5]!=null && s[6]!=null && s[8]===false && s[7]!=null && s[7]>100);
    const sampled  = airborne.length > 250 ? airborne.sort(() => 0.5 - Math.random()).slice(0, 250) : airborne;
    const flights  = sampled.map(s => {
      const callsign = (s[1]||'').trim(), squawk = (s[14]||'').trim();
      return {
        icao24: s[0], callsign: callsign||s[0], country: s[2]||'—',
        lat: s[6], lon: s[5],
        altitude: s[7]!=null ? Math.round(s[7]) : null,
        velocity: s[9]!=null ? Math.round(s[9]*3.6) : null,
        heading:  s[10]!=null ? Math.round(s[10]) : 0,
        squawk, isMilitary: MILITARY_PREFIXES.some(p => callsign.toUpperCase().startsWith(p)) || MILITARY_SQUAWKS.includes(squawk),
      };
    });
    res.json({ flights, total: airborne.length });
  } catch (e) { res.status(500).json({ error: e.message, flights: [] }); }
});

// /api/gdacs → GDACS RSS proxy (local dev)
app.get('/api/gdacs', async (req, res) => {
  try {
    const response = await fetch('https://www.gdacs.org/xml/rss.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 OSINT-Lens/1.0' }
    });
    const xml = await response.text();
    const items = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    itemMatches.forEach(item => {
      const lat = parseFloat(item.match(/<geo:lat>([\d.\-]+)<\/geo:lat>/)?.[1]);
      const lon = parseFloat(item.match(/<geo:long>([\d.\-]+)<\/geo:long>/)?.[1]);
      if (isNaN(lat) || isNaN(lon)) return;
      const get = tag => { const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)); return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g,'').trim() : ''; };
      items.push({
        title: get('title'), pubDate: get('pubDate'), lat, lon,
        eventtype:  item.match(/<gdacs:eventtype>([^<]+)<\/gdacs:eventtype>/)?.[1]?.trim() || 'UNKNOWN',
        alertlevel: item.match(/<gdacs:alertlevel>([^<]+)<\/gdacs:alertlevel>/)?.[1]?.trim() || 'Green',
        country:    item.match(/<gdacs:country>([^<]+)<\/gdacs:country>/)?.[1]?.trim() || '',
      });
    });
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message, items: [] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('OSINT Lens çalışıyor → http://localhost:' + PORT));
