<!-- ============================================================
  OUTSIDE IN MUSIC — RELEASES CATALOG WIDGET
  ============================================================
  Paste this entire block into a Squarespace Code Block.
  Data source: Apps Script JSON endpoint (set APPS_SCRIPT_URL below)
  Cover art: iTunes Search API (public, no key required)
============================================================ -->

<div id="oim-catalog-root">
  <style>
    #oim-catalog-root {
      --oim-ink: #1a1a18;
      --oim-ink-soft: #5f5e58;
      --oim-line: rgba(26,26,24,0.12);
      --oim-bg: #faf9f6;
      --oim-card: #ffffff;
      --oim-accent: #c4501f;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      color: var(--oim-ink);
      max-width: 1100px;
      margin: 0 auto;
    }
    #oim-catalog-root * { box-sizing: border-box; }

    .oim-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      padding: 0 0 20px;
      border-bottom: 1px solid var(--oim-line);
      margin-bottom: 24px;
    }
    .oim-chip {
      font-size: 13px;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--oim-line);
      background: transparent;
      color: var(--oim-ink-soft);
      cursor: pointer;
      white-space: nowrap;
    }
    .oim-chip.active {
      background: var(--oim-ink);
      color: #fff;
      border-color: var(--oim-ink);
    }
    .oim-search {
      flex: 1;
      min-width: 160px;
      font-size: 14px;
      padding: 7px 12px;
      border-radius: 999px;
      border: 1px solid var(--oim-line);
      background: var(--oim-bg);
    }
    .oim-view-toggle {
      display: flex;
      gap: 2px;
      margin-left: auto;
      border: 1px solid var(--oim-line);
      border-radius: 8px;
      overflow: hidden;
    }
    .oim-view-btn {
      font-size: 13px;
      padding: 6px 12px;
      border: none;
      background: transparent;
      color: var(--oim-ink-soft);
      cursor: pointer;
    }
    .oim-view-btn.active { background: var(--oim-ink); color: #fff; }

    .oim-status {
      font-size: 13px;
      color: var(--oim-ink-soft);
      padding: 40px 0;
      text-align: center;
    }

    .oim-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 22px 18px;
    }
    .oim-grid .oim-tile { cursor: pointer; }
    .oim-art {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 6px;
      background: #e8e6df;
      overflow: hidden;
      margin-bottom: 10px;
      position: relative;
    }
    .oim-art img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .oim-art-fallback {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; color: var(--oim-ink-soft); text-align: center; padding: 8px;
    }
    .oim-tile-title { font-size: 14px; font-weight: 600; line-height: 1.3; margin: 0 0 2px; }
    .oim-tile-artist { font-size: 13px; color: var(--oim-ink-soft); margin: 0 0 4px; }
    .oim-tile-meta { font-size: 11px; color: var(--oim-ink-soft); text-transform: uppercase; letter-spacing: 0.04em; }

    .oim-list { display: flex; flex-direction: column; gap: 1px; background: var(--oim-line); border: 1px solid var(--oim-line); border-radius: 8px; overflow: hidden; }
    .oim-row {
      display: flex; align-items: center; gap: 14px;
      background: var(--oim-card);
      padding: 10px 14px;
    }
    .oim-row-art {
      width: 48px; height: 48px; border-radius: 4px; background: #e8e6df;
      flex-shrink: 0; overflow: hidden;
    }
    .oim-row-art img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .oim-row-main { flex: 1; min-width: 0; }
    .oim-row-title { font-size: 14px; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .oim-row-sub { font-size: 12.5px; color: var(--oim-ink-soft); margin: 1px 0 0; }
    .oim-row-date { font-size: 12px; color: var(--oim-ink-soft); width: 90px; flex-shrink: 0; text-align: right; }
    .oim-row-link {
      font-size: 12px; padding: 5px 12px; border-radius: 999px;
      border: 1px solid var(--oim-line); color: var(--oim-ink);
      text-decoration: none; flex-shrink: 0;
    }
    .oim-row-link:hover { background: var(--oim-bg); }

    .oim-modal-backdrop {
      position: fixed; inset: 0; background: rgba(26,26,24,0.6);
      display: none; align-items: center; justify-content: center;
      padding: 20px; z-index: 9999;
    }
    .oim-modal-backdrop.open { display: flex; }
    .oim-modal {
      background: var(--oim-card); border-radius: 10px;
      max-width: 420px; width: 100%; padding: 24px;
      max-height: 85vh; overflow-y: auto;
    }
    .oim-modal-art { width: 100%; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: #e8e6df; margin-bottom: 16px; }
    .oim-modal-art img { width: 100%; height: 100%; object-fit: cover; }
    .oim-modal-title { font-size: 19px; font-weight: 600; margin: 0 0 2px; }
    .oim-modal-artist { font-size: 15px; color: var(--oim-ink-soft); margin: 0 0 14px; }
    .oim-modal-meta { font-size: 13px; color: var(--oim-ink-soft); margin: 0 0 18px; line-height: 1.6; }
    .oim-modal-links { display: flex; gap: 8px; flex-wrap: wrap; }
    .oim-modal-link {
      font-size: 13px; padding: 8px 16px; border-radius: 999px;
      text-decoration: none; font-weight: 500;
    }
    .oim-modal-link.primary { background: var(--oim-ink); color: #fff; }
    .oim-modal-link.secondary { border: 1px solid var(--oim-line); color: var(--oim-ink); }
    .oim-modal-close {
      position: absolute; top: 16px; right: 16px;
      width: 28px; height: 28px; border-radius: 50%;
      border: 1px solid var(--oim-line); background: var(--oim-card);
      cursor: pointer; font-size: 14px; line-height: 1;
    }
    .oim-modal { position: relative; }
  </style>

  <div class="oim-toolbar">
    <button class="oim-chip active" data-imprint="all">All</button>
    <button class="oim-chip" data-imprint="OiM">OiM</button>
    <button class="oim-chip" data-imprint="BespokeJazz">BespokeJazz</button>
    <button class="oim-chip" data-imprint="NextLevel">Next Level</button>
    <input type="text" class="oim-search" id="oim-search" placeholder="Search artist or title..." />
    <div class="oim-view-toggle">
      <button class="oim-view-btn active" data-view="grid">Grid</button>
      <button class="oim-view-btn" data-view="list">List</button>
    </div>
  </div>

  <div id="oim-content">
    <div class="oim-status">Loading releases…</div>
  </div>

  <div class="oim-modal-backdrop" id="oim-modal-backdrop">
    <div class="oim-modal" id="oim-modal-inner"></div>
  </div>

  <script>
  (function () {
    // ---- CONFIG: paste your deployed Apps Script Web App URL here ----
    var APPS_SCRIPT_URL = "https://oim-releases-proxy.vercel.app/api/releases";

    var state = {
      releases: [],
      imprint: "all",
      query: "",
      view: "grid"
    };

    var artCache = {};

    function fetchReleases() {
      return fetch(APPS_SCRIPT_URL, { redirect: "follow" })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (data) {
          state.releases = Array.isArray(data) ? data : [];
          state.releases.sort(function (a, b) {
            return new Date(b.releaseDate) - new Date(a.releaseDate);
          });
          render();
          enrichArtwork();
        })
        .catch(function (err) {
          document.getElementById("oim-content").innerHTML =
            '<div class="oim-status">Couldn\u2019t load releases right now.</div>';
          console.error("OIM catalog fetch error:", err);
        });
    }

    // Strips trailing parenthetical noise like "(SINGLE 1)", "(ALBUM)",
    // "(Bonus Single 2)", "(LP VERSION)" that confuses iTunes' search match.
    function cleanArtistForSearch(name) {
      return String(name || "")
        .replace(/\s*\([^)]*\)\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Loose normalize for comparison: lowercase, strip punctuation/spacing
    function normalize(s) {
      return String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    }

    // Does the returned result's artist plausibly match what we searched for?
    function artistMatches(result, cleanedArtist) {
      var resultArtist = normalize(result.artistName);
      var searchArtist = normalize(cleanedArtist);
      if (!resultArtist || !searchArtist) return false;
      return resultArtist.indexOf(searchArtist) !== -1 ||
        searchArtist.indexOf(resultArtist) !== -1;
    }

    // Does the returned result's title plausibly match? Used as a
    // confidence signal to prefer the right release among several by the
    // same artist — not a hard requirement, since iTunes title text often
    // differs from sheet title text in minor ways (capitalization of
    // featured-artist credits, live/studio tags, etc.) that shouldn't
    // disqualify an otherwise-correct match.
    function titleMatches(result, cleanedTitle) {
      var resultTitle = normalize(result.trackName || result.collectionName || "");
      var searchTitle = normalize(cleanedTitle);
      if (!resultTitle || !searchTitle) return false;
      return resultTitle.indexOf(searchTitle) !== -1 ||
        searchTitle.indexOf(resultTitle) !== -1;
    }

    // Strips parenthetical/bracketed noise from a title the same way
    // cleanArtistForSearch does for artist names — e.g. "(feat. X)",
    // "(Live)" — so title comparison isn't thrown off by credits/tags.
    function cleanTitleForSearch(title) {
      return String(title || "")
        .replace(/\s*[\(\[][^\)\]]*[\)\]]\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function searchArt(artist, title) {
      var cleanedArtist = cleanArtistForSearch(artist);
      var cleanedTitle = cleanTitleForSearch(title);
      var key = (cleanedArtist + "|" + cleanedTitle).toLowerCase();
      if (artCache.hasOwnProperty(key)) return Promise.resolve(artCache[key]);

      // Try Spotify first (better coverage for indie jazz), fall back
      // to iTunes proxy if Spotify returns nothing.
      var spotifyUrl = "https://oim-releases-proxy.vercel.app/api/spotify-artwork" +
        "?artist=" + encodeURIComponent(cleanedArtist) +
        "&title=" + encodeURIComponent(cleanedTitle);

      var itunesUrl = "https://oim-releases-proxy.vercel.app/api/artwork" +
        "?artist=" + encodeURIComponent(cleanedArtist) +
        "&title=" + encodeURIComponent(cleanedTitle);

      return fetch(spotifyUrl)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.artworkUrl) return data.artworkUrl;
          // Spotify came up empty — try iTunes
          return fetch(itunesUrl)
            .then(function (r) { return r.json(); })
            .then(function (itunesData) {
              var results = itunesData.results || [];
              if (!results.length) return null;
              var candidates = results.filter(function (result) {
                return artistMatches(result, cleanedArtist);
              });
              if (!candidates.length) return null;
              var best = candidates.find(function (result) {
                return titleMatches(result, cleanedTitle);
              }) || candidates[0];
              return best.artworkUrl100
                ? best.artworkUrl100.replace("100x100", "600x600")
                : null;
            })
            .catch(function () { return null; });
        })
        .catch(function () {
          // Spotify proxy itself failed — try iTunes directly
          return fetch(itunesUrl)
            .then(function (r) { return r.json(); })
            .then(function (itunesData) {
              var results = itunesData.results || [];
              if (!results.length) return null;
              var candidates = results.filter(function (result) {
                return artistMatches(result, cleanedArtist);
              });
              if (!candidates.length) return null;
              var best = candidates.find(function (result) {
                return titleMatches(result, cleanedTitle);
              }) || candidates[0];
              return best.artworkUrl100
                ? best.artworkUrl100.replace("100x100", "600x600")
                : null;
            })
            .catch(function () { return null; });
        })
        .then(function (art) {
          artCache[key] = art;
          return art;
        });
    }

    function enrichArtwork() {
      state.releases.forEach(function (release, i) {
        searchArt(release.artist, release.title).then(function (art) {
          if (!art) return;
          release._art = art;
          var els = document.querySelectorAll('[data-art-key="' + i + '"]');
          els.forEach(function (el) {
            el.innerHTML = '<img src="' + art + '" alt="' + escapeHtml(release.title) + ' cover art" loading="lazy" />';
          });
        });
      });
    }

    function escapeHtml(s) {
      var d = document.createElement("div");
      d.textContent = s || "";
      return d.innerHTML;
    }

    function formatDate(iso) {
      if (!iso) return "";
      var d = new Date(iso + "T00:00:00");
      if (isNaN(d)) return iso;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    function cleanArtistName(name) {
      return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
    }

    function getFiltered() {
      return state.releases.filter(function (r) {
        var imprintMatch =
          state.imprint === "all" ||
          (state.imprint === "OiM" && /^oim\b/i.test(r.imprint || "")) ||
          (state.imprint === "BespokeJazz" && /bespokejazz|white label|bspk/i.test(r.imprint || "")) ||
          (state.imprint === "NextLevel" && /next ?level/i.test(r.imprint || ""));
        var q = state.query.toLowerCase();
        var queryMatch =
          !q ||
          r.artist.toLowerCase().indexOf(q) !== -1 ||
          r.title.toLowerCase().indexOf(q) !== -1;
        return imprintMatch && queryMatch;
      });
    }

    function render() {
      var list = getFiltered();
      var content = document.getElementById("oim-content");

      if (!list.length) {
        content.innerHTML = '<div class="oim-status">No releases match.</div>';
        return;
      }

      if (state.view === "grid") {
        content.innerHTML =
          '<div class="oim-grid">' +
          list.map(function (r, i) {
            var realIndex = state.releases.indexOf(r);
            return (
              '<div class="oim-tile" data-index="' + realIndex + '">' +
              '<div class="oim-art" data-art-key="' + realIndex + '">' +
              (r._art
                ? '<img src="' + r._art + '" alt="' + escapeHtml(r.title) + ' cover art" loading="lazy" />'
                : '<div class="oim-art-fallback">' + escapeHtml(r.title) + '</div>') +
              "</div>" +
              '<p class="oim-tile-title">' + escapeHtml(r.title) + "</p>" +
              '<p class="oim-tile-artist">' + escapeHtml(cleanArtistName(r.artist)) + "</p>" +
              '<p class="oim-tile-meta">' + escapeHtml(r.type) + " \u00b7 " + formatDate(r.releaseDate) + "</p>" +
              "</div>"
            );
          }).join("") +
          "</div>";
      } else {
        content.innerHTML =
          '<div class="oim-list">' +
          list.map(function (r) {
            var realIndex = state.releases.indexOf(r);
            var link = r.presaveLink || r.amazonLink || "#";
            return (
              '<div class="oim-row" data-index="' + realIndex + '">' +
              '<div class="oim-row-art" data-art-key="' + realIndex + '">' +
              (r._art ? '<img src="' + r._art + '" alt="" loading="lazy" />' : "") +
              "</div>" +
              '<div class="oim-row-main">' +
              '<p class="oim-row-title">' + escapeHtml(r.title) + "</p>" +
              '<p class="oim-row-sub">' + escapeHtml(cleanArtistName(r.artist)) + " \u00b7 " + escapeHtml(r.type) + "</p>" +
              "</div>" +
              '<div class="oim-row-date">' + formatDate(r.releaseDate) + "</div>" +
              (link !== "#"
                ? '<a class="oim-row-link" href="' + link + '" target="_blank" rel="noopener">Listen</a>'
                : "") +
              "</div>"
            );
          }).join("") +
          "</div>";
      }

      content.querySelectorAll("[data-index]").forEach(function (el) {
        el.addEventListener("click", function (e) {
          if (e.target.closest(".oim-row-link")) return;
          openModal(parseInt(el.getAttribute("data-index"), 10));
        });
      });
    }

    function openModal(index) {
      var r = state.releases[index];
      if (!r) return;
      var link = r.presaveLink || r.amazonLink;
      document.getElementById("oim-modal-inner").innerHTML =
        '<button class="oim-modal-close" id="oim-modal-close" aria-label="Close">\u2715</button>' +
        '<div class="oim-modal-art">' +
        (r._art ? '<img src="' + r._art + '" alt="" />' : "") +
        "</div>" +
        '<p class="oim-modal-title">' + escapeHtml(r.title) + "</p>" +
        '<p class="oim-modal-artist">' + escapeHtml(cleanArtistName(r.artist)) + "</p>" +
        '<p class="oim-modal-meta">' + escapeHtml(r.type) + " \u00b7 " + formatDate(r.releaseDate) +
        (r.catalogId ? " \u00b7 " + escapeHtml(r.catalogId) : "") +
        (r.imprint ? "<br/>" + escapeHtml(r.imprint) : "") + "</p>" +
        '<div class="oim-modal-links">' +
        (link ? '<a class="oim-modal-link primary" href="' + link + '" target="_blank" rel="noopener">Listen now</a>' : "") +
        (r.amazonLink && r.amazonLink !== link ? '<a class="oim-modal-link secondary" href="' + r.amazonLink + '" target="_blank" rel="noopener">Buy</a>' : "") +
        "</div>";
      document.getElementById("oim-modal-backdrop").classList.add("open");
      document.getElementById("oim-modal-close").addEventListener("click", closeModal);
    }

    function closeModal() {
      document.getElementById("oim-modal-backdrop").classList.remove("open");
    }

    document.getElementById("oim-modal-backdrop").addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });

    document.querySelectorAll(".oim-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".oim-chip").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        state.imprint = btn.getAttribute("data-imprint");
        render();
      });
    });

    document.querySelectorAll(".oim-view-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".oim-view-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        state.view = btn.getAttribute("data-view");
        render();
      });
    });

    document.getElementById("oim-search").addEventListener("input", function (e) {
      state.query = e.target.value;
      render();
    });

    fetchReleases();
  })();
  </script>
</div>
