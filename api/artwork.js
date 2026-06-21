// api/artwork.js
//
// Proxies iTunes Search API requests server-side. iTunes' public search
// endpoint is unofficial and can silently stop sending CORS headers or
// block browser-origin requests — calling it server-to-server sidesteps
// that entirely, the same way api/releases.js sidesteps the Apps Script
// CORS issue.
//
// Usage from the widget:
//   /api/artwork?artist=...&title=...
// Returns: { artworkUrl: "https://..." } or { artworkUrl: null }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const artist = (req.query.artist || "").toString();
  const title = (req.query.title || "").toString();

  if (!artist && !title) {
    res.status(400).json({ error: "Missing artist and/or title query params" });
    return;
  }

  const term = encodeURIComponent((artist + " " + title).trim());
  const itunesUrl =
    "https://itunes.apple.com/search?term=" + term + "&entity=album,song&limit=10";

  try {
    const response = await fetch(itunesUrl);

    if (!response.ok) {
      res.status(502).json({ error: "iTunes upstream error", status: response.status });
      return;
    }

    const data = await response.json();

    // Cache aggressively — artwork for a given artist/title pair never
    // changes, so a long cache here saves both iTunes and Vercel function
    // invocations on repeat visits.
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).json({ results: data.results || [] });
  } catch (err) {
    res.status(500).json({ error: "Proxy fetch failed", message: String(err) });
  }
}
