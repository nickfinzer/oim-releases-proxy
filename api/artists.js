// api/artists.js
//
// Reads the "Artists" tab from the OiM Project Management sheet and
// returns a JSON array of artist profiles. Same pattern as releases.js.
// Serves bio, photo, links — all editable directly in the sheet.

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwHX1ZssmwYgQFFE35Y7BdHHzqdm6QAizTAOw1HVSQ2hemhrb3OhHdBVPJxi3j4Gu0q2Q/exec?sheet=Artists";

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
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy fetch failed", message: String(err) });
  }
}
