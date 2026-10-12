/* CERTIFIED_V10 — public schedule logic.
   Pure functions, no DOM. Loaded as a browser global (CVSchedule) and as a
   CommonJS module for the tests in tests/. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CVSchedule = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ARTIST_IDS = ["mawon", "ossy", "tew", "wichaya", "maxlerr"];
  var STATUSES = ["confirmed", "cancelled", "postponed"];
  var OFFSET_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var URL_HOSTS = [
    "instagram.com", "lin.ee", "line.me", "youtube.com", "youtu.be",
    "tiktok.com", "maps.app.goo.gl", "google.com"
  ];
  /* Proposed budgets, to be agreed with the owner. */
  var BUDGET = { refreshMs: 15 * 60000, staleMs: 60 * 60000, hardStaleMs: 24 * 3600000 };
  /* Zones without daylight saving, so one fixed abbreviation is always right.
     Any other zone falls back to the GMT offset. */
  var ZONE_LABELS = { "Asia/Bangkok": "ICT", "Australia/Brisbane": "AEST" };
  var LOCALES = { en: "en-GB", th: "th-TH-u-ca-gregory-nu-latn" };

  function parseInstant(value) {
    if (typeof value !== "string" || !OFFSET_RE.test(value)) return NaN;
    return Date.parse(value);
  }

  function validTimeZone(tz) {
    if (typeof tz !== "string" || tz.indexOf("/") < 1) return false;
    try { new Intl.DateTimeFormat("en-GB", { timeZone: tz }); return true; }
    catch (e) { return false; }
  }

  function safeUrl(value) {
    if (typeof value !== "string") return null;
    var url;
    try { url = new URL(value); } catch (e) { return null; }
    if (url.protocol !== "https:") return null;
    var host = url.hostname.toLowerCase();
    var allowed = URL_HOSTS.some(function (h) {
      return host === h || host.slice(-(h.length + 1)) === "." + h;
    });
    return allowed ? url.href : null;
  }

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  /* Turns a feed envelope into validated public occurrences. Only the fields
     named here are copied, so anything else in the source never reaches the page. */
  function normalize(envelope, opts) {
    opts = opts || {};
    var roster = opts.artistIds || ARTIST_IDS;
    var out = { events: [], rejected: [], conflicts: [], invalid: false };
    if (!envelope || !Array.isArray(envelope.events)) {
      out.invalid = true;
      return out;
    }
    var seen = {};
    envelope.events.forEach(function (raw) {
      var id = raw && typeof raw.publicId === "string" ? raw.publicId : null;
      function reject(reason) { out.rejected.push({ publicId: id, reason: reason }); }
      if (!raw || typeof raw !== "object") return reject("not-an-object");
      if (!id) return reject("missing-id");
      if (seen[id]) return reject("duplicate");
      if (raw.public !== true) return reject("not-public");
      if (raw.approved !== true) return reject("not-approved");
      if (raw.isDemo === true && !opts.allowDemo) return reject("demo-outside-preview");
      if (!Array.isArray(raw.artistIds) || !raw.artistIds.length) return reject("no-artists");
      var artists = [];
      for (var i = 0; i < raw.artistIds.length; i++) {
        if (roster.indexOf(raw.artistIds[i]) < 0) return reject("unknown-artist");
        if (artists.indexOf(raw.artistIds[i]) < 0) artists.push(raw.artistIds[i]);
      }
      if (STATUSES.indexOf(raw.status) < 0) return reject("bad-status");
      var startMs = parseInstant(raw.startAt), endMs = parseInstant(raw.endAt);
      if (isNaN(startMs) || isNaN(endMs)) return reject("bad-time");
      if (endMs <= startMs) return reject("end-not-after-start");
      if (!validTimeZone(raw.venueTimeZone)) return reject("bad-timezone");
      if (!text(raw.venueName)) return reject("no-venue");
      if (raw.serviceDate != null && !DATE_RE.test(raw.serviceDate)) return reject("bad-service-date");
      seen[id] = true;
      out.events.push({
        publicId: id,
        artistIds: artists,
        title: text(raw.title),
        venueName: text(raw.venueName),
        city: text(raw.city),
        venueTimeZone: raw.venueTimeZone,
        startAt: raw.startAt,
        endAt: raw.endAt,
        startMs: startMs,
        endMs: endMs,
        serviceDate: raw.serviceDate || null,
        status: raw.status,
        isDemo: raw.isDemo === true,
        isCollectiveShow: raw.isCollectiveShow === true,
        officialDetailsUrl: safeUrl(raw.officialDetailsUrl),
        ticketUrl: safeUrl(raw.ticketUrl),
        verifiedMapUrl: safeUrl(raw.verifiedMapUrl),
        sourceUpdatedAt: text(raw.sourceUpdatedAt)
      });
    });
    out.events.sort(function (a, b) { return a.startMs - b.startMs || (a.publicId < b.publicId ? -1 : 1); });

    /* Two confirmed sets for one artist that overlap are a publishing error. */
    roster.forEach(function (artistId) {
      var mine = out.events.filter(function (e) {
        return e.status === "confirmed" && e.artistIds.indexOf(artistId) >= 0;
      });
      for (var a = 0; a < mine.length; a++) {
        for (var b = a + 1; b < mine.length; b++) {
          if (mine[b].startMs < mine[a].endMs) {
            out.conflicts.push({
              artistId: artistId,
              publicIds: [mine[a].publicId, mine[b].publicId],
              untilMs: Math.max(mine[a].endMs, mine[b].endMs)
            });
          }
        }
      }
    });
    return out;
  }

  /* state: "live" | "upcoming" | "none" | "conflict" */
  function selectForArtist(norm, artistId, now) {
    var conflicted = norm.conflicts.some(function (c) {
      return c.artistId === artistId && c.untilMs > now;
    });
    if (conflicted) return { state: "conflict", event: null, notice: null };
    var mine = norm.events.filter(function (e) {
      return e.artistIds.indexOf(artistId) >= 0 && e.endMs > now;
    });
    var chosen = null, state = "none";
    for (var i = 0; i < mine.length; i++) {
      if (mine[i].status !== "confirmed") continue;
      chosen = mine[i];
      state = chosen.startMs <= now ? "live" : "upcoming";
      break;
    }
    var notice = null;
    for (var j = 0; j < mine.length; j++) {
      if (mine[j].status === "confirmed") continue;
      if (!chosen || mine[j].startMs <= chosen.startMs) { notice = mine[j]; break; }
    }
    return { state: state, event: chosen, notice: notice };
  }

  function collectiveShows(norm, now) {
    return norm.events.filter(function (e) {
      return e.isCollectiveShow && e.status === "confirmed" && e.endMs > now;
    });
  }

  function partsOf(ms, timeZone, options, lang) {
    var fmt = new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.en, Object.assign({ timeZone: timeZone }, options));
    var map = {};
    fmt.formatToParts(ms).forEach(function (p) { map[p.type] = p.value; });
    return map;
  }

  /* Calendar date in the venue's zone, as YYYY-MM-DD. */
  function localDate(ms, timeZone) {
    var p = partsOf(ms, timeZone, { year: "numeric", month: "2-digit", day: "2-digit" }, "en");
    return p.year + "-" + p.month + "-" + p.day;
  }

  /* "Tonight" comes from the approved service date in venue time, never the viewer's device. */
  function isTonight(event, now) {
    return !!event.serviceDate && event.serviceDate === localDate(now, event.venueTimeZone);
  }

  function zoneLabel(timeZone, ms) {
    if (ZONE_LABELS[timeZone]) return ZONE_LABELS[timeZone];
    var p = partsOf(ms, timeZone, { hour: "2-digit", timeZoneName: "short" }, "en");
    return p.timeZoneName || timeZone;
  }

  function formatTime(ms, timeZone) {
    var p = partsOf(ms, timeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, "en");
    return p.hour + ":" + p.minute + " " + zoneLabel(timeZone, ms);
  }

  function formatDateTime(ms, timeZone, lang) {
    var p = partsOf(ms, timeZone, { weekday: "short", day: "numeric", month: "short", year: "numeric" }, lang);
    return p.weekday + " " + p.day + " " + p.month + " " + p.year + ", " + formatTime(ms, timeZone);
  }

  /* Weekday and date for a plain YYYY-MM-DD service date. */
  function formatDate(date, lang) {
    if (!DATE_RE.test(date)) return "";
    var p = partsOf(Date.parse(date + "T12:00:00Z"), "UTC",
      { weekday: "short", day: "numeric", month: "short", year: "numeric" }, lang);
    return p.weekday + " " + p.day + " " + p.month + " " + p.year;
  }

  /* Never negative. Days and hours above 24h, hours and minutes below. */
  function countdownParts(ms) {
    if (!(ms > 0)) return { kind: "now" };
    if (ms < 60000) return { kind: "soon" };
    var minutes = Math.ceil(ms / 60000);
    if (minutes >= 1440) return { kind: "days", d: Math.floor(minutes / 1440), h: Math.floor((minutes % 1440) / 60) };
    return { kind: "hours", h: Math.floor(minutes / 60), m: minutes % 60 };
  }

  function freshness(lastSuccessMs, now, budget) {
    budget = budget || BUDGET;
    if (typeof lastSuccessMs !== "number" || isNaN(lastSuccessMs)) return "unknown";
    var age = now - lastSuccessMs;
    if (age > budget.hardStaleMs) return "hard-stale";
    if (age > budget.staleMs) return "stale";
    return "fresh";
  }

  /* Milliseconds until the next minute boundary, set start/end or freshness
     threshold — whichever is first. Null when nothing can change. */
  function nextWake(norm, now, lastSuccessMs, budget) {
    budget = budget || BUDGET;
    var best = Infinity, pending = false;
    norm.events.forEach(function (e) {
      if (e.endMs > now) pending = true;
      [e.startMs, e.endMs].forEach(function (t) {
        if (t > now) best = Math.min(best, t - now);
      });
    });
    if (pending) best = Math.min(best, 60000 - (now % 60000));
    if (typeof lastSuccessMs === "number") {
      [lastSuccessMs + budget.staleMs, lastSuccessMs + budget.hardStaleMs].forEach(function (t) {
        if (t >= now) best = Math.min(best, t - now + 1);
      });
    }
    return best === Infinity ? null : Math.max(50, best);
  }

  return {
    ARTIST_IDS: ARTIST_IDS,
    BUDGET: BUDGET,
    parseInstant: parseInstant,
    safeUrl: safeUrl,
    normalize: normalize,
    selectForArtist: selectForArtist,
    collectiveShows: collectiveShows,
    localDate: localDate,
    isTonight: isTonight,
    zoneLabel: zoneLabel,
    formatTime: formatTime,
    formatDateTime: formatDateTime,
    formatDate: formatDate,
    countdownParts: countdownParts,
    freshness: freshness,
    nextWake: nextWake
  };
});
