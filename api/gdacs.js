export default async function handler(req, res) {
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

      const get = tag => {
        const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
      };

      items.push({
        title:      get('title'),
        pubDate:    get('pubDate'),
        lat,
        lon,
        eventtype:  item.match(/<gdacs:eventtype>([^<]+)<\/gdacs:eventtype>/)?.[1]?.trim() || 'UNKNOWN',
        alertlevel: item.match(/<gdacs:alertlevel>([^<]+)<\/gdacs:alertlevel>/)?.[1]?.trim() || 'Green',
        country:    item.match(/<gdacs:country>([^<]+)<\/gdacs:country>/)?.[1]?.trim() || '',
      });
    });

    res.setHeader('Cache-Control', 's-maxage=300');
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message, items: [] });
  }
}
