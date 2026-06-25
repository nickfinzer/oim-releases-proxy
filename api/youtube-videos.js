// api/youtube-videos.js
//
// Searches the Outside In Music YouTube channel for videos
// matching a given artist name. Used by the artist profile view
// to show relevant videos inline.
//
// Usage: /api/youtube-videos?artist=Javier+Nero
// Returns: { videos: [ { videoId, title, thumbnail, publishedAt, url } ] }
//
// Uses YouTube Data API v3 — requires YOUTUBE_API_KEY in Vercel env vars.
// Get a free key at: console.cloud.google.com → APIs → YouTube Data API v3

const OIM_CHANNEL_ID = "UCxxx"; // ← will be resolved at first request if blank
const CHANNEL_HANDLE = "@outside-in-music";
const YT_SEARCH_URL  = "https://www.googleapis.com/youtube/v3/search";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const artist = (req.query.artist || "").toString().trim();
  if (!artist) {
    res.status(400).json({ error: "Missing artist param", videos: [] });
    return;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // Graceful degradation — no API key means no videos, not an error
    res.status(200).json({ videos: [] });
    return;
  }

  try {
    // Search within the OiM channel for this artist name
    const params = new URLSearchParams({
      key:        apiKey,
      channelId:  process.env.OIM_CHANNEL_ID || "UCl6gzDhmm7paQXEnPlwae0A",
      q:          artist,
      part:       "snippet",
      type:       "video",
      maxResults: "6",
      order:      "relevance"
    });

    const response = await fetch(`${YT_SEARCH_URL}?${params}`);
    if (!response.ok) {
      throw new Error("YouTube API error: " + response.status);
    }

    const data = await response.json();
    const rawItems = data.items || [];
    console.log("YouTube API response:", JSON.stringify({ totalResults: data.pageInfo?.totalResults, itemCount: rawItems.length, error: data.error }));
    const videos = rawItems.map(item => ({
      videoId:     item.id.videoId,
      title:       item.snippet.title,
      thumbnail:   item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt?.slice(0, 10),
      url:         `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=300");
    res.status(200).json({ videos, debug_total: data.pageInfo?.totalResults, debug_error: data.error });

  } catch (err) {
    console.error("YouTube video fetch error:", err.message);
    // Return error details so we can debug — will switch back to silent fail once working
    res.status(200).json({ videos: [], debug_error: err.message });
  }
}
