// api/back-catalog.js
//
// Serves the static back catalog JSON. Uses fs.readFileSync instead of
// import assertions, which aren't supported in Vercel's Node runtime.

import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const filePath = join(process.cwd(), "data", "back-catalog.json");
    const data = JSON.parse(readFileSync(filePath, "utf8"));
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (err) {
    console.error("back-catalog read error:", err.message);
    res.status(500).json({ error: "Failed to load back catalog", message: String(err) });
  }
}
