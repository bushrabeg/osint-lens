const MILITARY_PREFIXES = ['RCH','REACH','CNV','JAKE','PAVE','SPAR','NAVY','USAF','RRR','COMET','RFF','RSD','NATO'];
const MILITARY_SQUAWKS  = ['7777','7400','7600','7700'];
const CACHE_TTL_MS      = 60_000; // 60 saniye — OpenSky anonim limit

// Vercel serverless instance başına in-memory cache
let cache = { data: null, ts: 0 };

function processStates(states) {
  const airborne = states.filter(s =>
    s[5] != null && s[6] != null && s[8] === false && s[7] != null && s[7] > 100
  );
  const sampled = airborne.length > 250
    ? airborne.sort(() => 0.5 - Math.random()).slice(0, 250)
    : airborne;

  const flights = sampled.map(s => {
    const callsign = (s[1] || '').trim();
    const squawk   = (s[14] || '').trim();
    return {
      icao24:     s[0],
      callsign:   callsign || s[0],
      country:    s[2] || '—',
      lat:        s[6],
      lon:        s[5],
      altitude:   s[7]  != null ? Math.round(s[7])       : null,
      velocity:   s[9]  != null ? Math.round(s[9] * 3.6) : null,
      heading:    s[10] != null ? Math.round(s[10])       : 0,
      squawk,
      isMilitary: MILITARY_PREFIXES.some(p => callsign.toUpperCase().startsWith(p)) ||
                  MILITARY_SQUAWKS.includes(squawk),
    };
  });

  return { flights, total: airborne.length };
}

export default async function handler(req, res) {
  const now = Date.now();

  // Cache geçerliyse direkt dön
  if (cache.data && (now - cache.ts) < CACHE_TTL_MS) {
    const age = Math.round((now - cache.ts) / 1000);
    console.log(`[opensky] cache hit — yaş: ${age}s, uçak: ${cache.data.flights.length}`);
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    res.setHeader('X-Cache', 'HIT');
    return res.json(cache.data);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('https://opensky-network.org/api/states/all?lamin=-90&lomin=-180&lamax=90&lomax=180', {
      headers: { 'User-Agent': 'OSINTLens/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.status === 429) {
      console.warn('[opensky] 429 rate limit — cache varsa onu dön');
      if (cache.data) return res.json({ ...cache.data, cached: true });
      return res.status(429).json({ error: 'OpenSky rate limit, tekrar dene', flights: [] });
    }
    if (!response.ok) throw new Error('OpenSky HTTP ' + response.status);

    const raw = await response.json();
    const result = processStates(raw.states || []);

    console.log(`[opensky] taze veri — toplam havada: ${result.total}, döndürülen: ${result.flights.length}`);

    cache = { data: result, ts: now };
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  } catch (e) {
    console.error('[opensky] hata:', e.message);
    // Hata durumunda eski cache varsa dön
    if (cache.data) {
      console.warn('[opensky] hata — eski cache döndürülüyor');
      return res.json({ ...cache.data, stale: true });
    }
    res.status(500).json({ error: e.message, flights: [] });
  }
}
