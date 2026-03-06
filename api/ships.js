// AIS Ship Tracking — AISHub (ücretsiz, kullanıcı adı gerekli)
// Ücretsiz kayıt: https://www.aishub.net/join-us
// Vercel'de AISHUB_USERNAME env variable olarak tanımla

const MILITARY_TYPES = [35, 36, 37];
const CACHE_TTL_MS   = 120_000; // 2 dakika

let cache = { data: null, ts: 0 };

function getShipCategory(typeCode) {
  const t = parseInt(typeCode) || 0;
  if (t >= 70 && t <= 79) return 'KARGO';
  if (t >= 80 && t <= 89) return 'TANKER';
  if (t >= 60 && t <= 69) return 'YOLCU';
  if (t === 30)            return 'BALIKÇI';
  if (t >= 35 && t <= 37)  return 'ASKERİ';
  if (t >= 50 && t <= 59)  return 'ÖZEL';
  return 'GEMİ';
}

function processVessels(rawData) {
  if (!Array.isArray(rawData) || rawData.length < 2) return { vessels: [], total: 0 };

  // AISHub: ilk eleman header objesi, geri kalanı gemi kayıtları
  const items = rawData.slice(1);

  const valid = items.filter(v =>
    v.MMSI != null &&
    v.LATITUDE  != null && v.LONGITUDE != null &&
    Math.abs(parseFloat(v.LATITUDE))  <= 90 &&
    Math.abs(parseFloat(v.LONGITUDE)) <= 180
  );

  const sampled = valid.length > 300
    ? valid.sort(() => 0.5 - Math.random()).slice(0, 300)
    : valid;

  const vessels = sampled.map(v => ({
    mmsi:        v.MMSI?.toString(),
    name:        (v.NAME      || '').trim() || v.MMSI?.toString(),
    callsign:    (v.CALLSIGN  || '').trim() || '—',
    lat:         parseFloat(v.LATITUDE),
    lon:         parseFloat(v.LONGITUDE),
    heading:     v.HEADING != null ? parseInt(v.HEADING)
                 : v.COG   != null ? parseInt(v.COG) : 0,
    speed:       v.SOG != null ? parseFloat(v.SOG).toFixed(1) : null,
    flag:        v.FLAG        || '—',
    destination: (v.DESTINATION || '').trim() || '—',
    shipType:    parseInt(v.SHIPTYPE) || 0,
    category:    getShipCategory(v.SHIPTYPE),
    isMilitary:  MILITARY_TYPES.includes(parseInt(v.SHIPTYPE) || 0),
  }));

  return { vessels, total: valid.length };
}

export default async function handler(req, res) {
  const now = Date.now();

  if (cache.data && (now - cache.ts) < CACHE_TTL_MS) {
    const age = Math.round((now - cache.ts) / 1000);
    console.log(`[ships] cache hit — yaş: ${age}s, gemi: ${cache.data.vessels.length}`);
    res.setHeader('Cache-Control', 'public, s-maxage=120');
    res.setHeader('X-Cache', 'HIT');
    return res.json(cache.data);
  }

  const username = process.env.AISHUB_USERNAME;
  if (!username) {
    console.warn('[ships] AISHUB_USERNAME env var eksik');
    return res.status(200).json({ vessels: [], total: 0, error: 'AISHUB_USERNAME not configured' });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    const url = `https://data.aishub.net/ws.php?username=${encodeURIComponent(username)}&format=1&output=json&compress=0`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OSINTLens/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.status === 429) {
      console.warn('[ships] 429 rate limit');
      if (cache.data) return res.json({ ...cache.data, cached: true });
      return res.status(429).json({ error: 'AISHub rate limit', vessels: [] });
    }
    if (!response.ok) throw new Error('AISHub HTTP ' + response.status);

    const raw = await response.json();

    // AISHub hata yanıtı: [{ERROR: "..."}]
    if (Array.isArray(raw) && raw.length === 1 && raw[0]?.ERROR) {
      throw new Error('AISHub: ' + raw[0].ERROR);
    }

    const result = processVessels(raw);
    console.log(`[ships] taze veri — toplam geçerli: ${result.total}, döndürülen: ${result.vessels.length}`);

    cache = { data: result, ts: now };
    res.setHeader('Cache-Control', 'public, s-maxage=120');
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  } catch (e) {
    console.error('[ships] hata:', e.message);
    if (cache.data) {
      console.warn('[ships] hata — eski cache döndürülüyor');
      return res.json({ ...cache.data, stale: true });
    }
    res.status(500).json({ error: e.message, vessels: [] });
  }
}
