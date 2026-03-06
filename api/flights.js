// OpenSky ağı: key gerektirmiyor, CORS engelini server tarafında aşıyoruz
const MILITARY_PREFIXES = [
  'RCH','REACH','CNV','JAKE','PAVE','SPAR','NAVY','USAF',
  'RRR','COMET','RFF','RSD','NATO','THUD','VIGOR','TOPGUN',
  'DUKE','HAWK','EAGLE','VIPER','GHOST','RAPTOR',
];
const MILITARY_SQUAWKS = ['7777','7400','7600','7700'];

export default async function handler(req, res) {
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

    // Havada olan, koordinatı tam, irtifası olan uçaklar
    const airborne = (data.states || []).filter(s =>
      s[5] != null && s[6] != null &&
      s[8] === false &&
      s[7] != null && s[7] > 100
    );

    // Max 250 — haritayı yavaşlatmamak için örnekle
    const sampled = airborne.length > 250
      ? airborne.sort(() => 0.5 - Math.random()).slice(0, 250)
      : airborne;

    const flights = sampled.map(s => {
      const callsign = (s[1] || '').trim();
      const squawk   = (s[14] || '').trim();
      const isMilitary =
        MILITARY_PREFIXES.some(p => callsign.toUpperCase().startsWith(p)) ||
        MILITARY_SQUAWKS.includes(squawk);
      return {
        icao24:   s[0],
        callsign: callsign || s[0],
        country:  s[2] || '—',
        lat:      s[6],
        lon:      s[5],
        altitude: s[7]  != null ? Math.round(s[7])       : null, // metre
        velocity: s[9]  != null ? Math.round(s[9] * 3.6) : null, // km/h
        heading:  s[10] != null ? Math.round(s[10])      : 0,
        squawk,
        isMilitary,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=25');
    res.json({ flights, total: airborne.length });
  } catch (e) {
    res.status(500).json({ error: e.message, flights: [] });
  }
}
