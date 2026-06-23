// api/spotify-artwork.js
//
// Fetches album/track artwork from Spotify's Web API using the
// Client Credentials flow (no user login required — public catalog
// data only). Credentials stay server-side in Vercel env vars,
// never exposed to the browser.
//
// Usage: /api/spotify-artwork?artist=...&title=...
// Returns: { artworkUrl: "https://..." } or { artworkUrl: null }

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Simple in-memory token cache — reuses the token across requests
// within the same function instance lifetime rather than fetching
// a new one on every single artwork lookup.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 30000) {
    return cachedToken;
  }

  const credentials = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + credentials,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error("Spotify token fetch failed: " + response.status);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000);
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
    res.status(400).json({ error: "Missing artist and/or title" });
    return;
  }

  try {
    const token = await getAccessToken();

    // Search tracks first (better title-level match), then albums as
    // fallback (catches releases not indexed as individual tracks).
    const query = encodeURIComponent(
      "track:" + title + " artist:" + artist
    );
    const trackUrl =
      "https://api.spotify.com/v1/search?q=" + query +
      "&type=track&limit=5&market=US";

    const trackResponse = await fetch(trackUrl, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!trackResponse.ok) {
      throw new Error("Spotify search failed: " + trackResponse.status);
    }

    const trackData = await trackResponse.json();
    const tracks = (trackData.tracks && trackData.tracks.items) || [];

    if (tracks.length > 0) {
      const images = tracks[0].album.images || [];
      // Prefer the largest image (first in array), minimum 300px
      const image = images.find(function (img) { return img.width >= 300; }) || images[0];
      if (image) {
        res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
        res.status(200).json({ artworkUrl: image.url });
        return;
      }
    }

    // No track result — try album search as fallback
    const albumQuery = encodeURIComponent(
      "album:" + title + " artist:" + artist
    );
    const albumUrl =
      "https://api.spotify.com/v1/search?q=" + albumQuery +
      "&type=album&limit=5&market=US";

    const albumResponse = await fetch(albumUrl, {
      headers: { Authorization: "Bearer " + token }
    });

    if (albumResponse.ok) {
      const albumData = await albumResponse.json();
      const albums = (albumData.albums && albumData.albums.items) || [];
      if (albums.length > 0) {
        const images = albums[0].images || [];
        const image = images.find(function (img) { return img.width >= 300; }) || images[0];
        if (image) {
          res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
          res.status(200).json({ artworkUrl: image.url });
          return;
        }
      }
    }

    // Nothing found on Spotify
    res.setHeader("Cache-Control", "s-maxage=3600");
    res.status(200).json({ artworkUrl: null });
  } catch (err) {
    res.status(500).json({ error: "Spotify artwork lookup failed", message: String(err) });
  }
}
