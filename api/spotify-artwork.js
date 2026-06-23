// api/spotify-artwork.js
//
// Proxies Spotify Search API requests server-side using Client Credentials
// OAuth flow. Credentials stay in Vercel environment variables and never
// reach the browser.
//
// Usage: /api/spotify-artwork?artist=...&title=...
// Returns: { artworkUrl: "https://..." } or { artworkUrl: null }

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";

// Simple in-memory token cache — persists for the lifetime of the
// Vercel function instance (typically minutes), reducing token requests.
let cachedToken = null;
let tokenExpiry = 0;

async function getSpotifyToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars");
  }

  const credentials = Buffer.from(clientId + ":" + clientSecret).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + credentials,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error("Spotify token request failed: " + response.status);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const artist = (req.query.artist || "").toString().trim();
  const title = (req.query.title || "").toString().trim();

  if (!artist && !title) {
    res.status(400).json({ error: "Missing artist and/or title", artworkUrl: null });
    return;
  }

  try {
    const token = await getSpotifyToken();

    // Use plain full-text search rather than strict artist:/track: field
    // filters. Field filters are precise but fail when the sheet artist
    // name differs from Spotify's canonical listing (e.g. "JEK Trio" vs
    // "Silvan Joray, Jakob Ebers, Jeff Krol"). Full-text search is more
    // forgiving and finds most releases even with naming discrepancies.
    const trackQuery = encodeURIComponent(artist + " " + title);
    const trackUrl = SPOTIFY_SEARCH_URL + "?q=" + trackQuery + "&type=track&limit=5";

    const trackResponse = await fetch(trackUrl, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!trackResponse.ok) {
      throw new Error("Spotify search failed: " + trackResponse.status);
    }

    const trackData = await trackResponse.json();
    const tracks = trackData.tracks?.items || [];

    if (tracks.length > 0 && tracks[0].album?.images?.length > 0) {
      const artworkUrl = tracks[0].album.images[0].url;
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
      res.status(200).json({ artworkUrl });
      return;
    }

    // No track match — try plain full-text album search
    const albumQuery = encodeURIComponent(artist + " " + title);
    const albumUrl = SPOTIFY_SEARCH_URL + "?q=" + albumQuery + "&type=album&limit=5";

    const albumResponse = await fetch(albumUrl, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!albumResponse.ok) {
      throw new Error("Spotify album search failed: " + albumResponse.status);
    }

    const albumData = await albumResponse.json();
    const albums = albumData.albums?.items || [];

    if (albums.length > 0 && albums[0].images?.length > 0) {
      const artworkUrl = albums[0].images[0].url;
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
      res.status(200).json({ artworkUrl });
      return;
    }

    // Nothing found on Spotify
    res.setHeader("Cache-Control", "s-maxage=3600");
    res.status(200).json({ artworkUrl: null });

  } catch (err) {
    console.error("Spotify artwork error:", err.message);
    res.status(500).json({ error: String(err), artworkUrl: null });
  }
}
