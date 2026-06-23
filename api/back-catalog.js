// api/back-catalog.js
//
// Serves the static back catalog JSON (pre-2024 + full OiM inventory
// from the AMPED/distribution export). This data rarely changes so it's
// baked in as a static import rather than hitting a live data source.
// Cache aggressively — 24 hours at the edge.

import catalog from "../data/back-catalog.json" assert { type: "json" };

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
  res.status(200).json(catalog);
}
