// api/releases.js
//
// Vercel serverless function. Fetches the Apps Script Web App URL
// server-side (no browser, no CORS restrictions apply server-to-server)
// and re-serves the JSON with proper CORS headers so the Squarespace
// widget can fetch it directly.

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzPXSXA2KBfiigfaQHMhH0qJX5j6DjVQg4EeGWOQkiHH61FTOajlN8gvcKojlYA6PB5sQ/exec";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, { redirect: "follow" });

    if (!response.ok) {
      res.status(502).json({ error: "Upstream error", status: response.status });
      return;
    }

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      // Apps Script returned something that isn't JSON (commonly an
      // HTML auth/permission page). Surface a snippet so we can see
      // exactly what came back instead of failing opaquely.
      res.status(502).json({
        error: "Upstream did not return JSON",
        snippet: text.slice(0, 500)
      });
      return;
    }

    // Cache for 5 minutes at the edge so repeat visitors aren't
    // each triggering a fresh Apps Script execution.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy fetch failed", message: String(err) });
  }
}
