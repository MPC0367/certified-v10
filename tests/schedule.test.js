"use strict";
/* Run with: node --test tests/schedule.test.js
   Every case uses a fixed clock; nothing reads the real time. */
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../schedule.js");

const at = (iso) => Date.parse(iso);
const base = {
  public: true, approved: true, status: "confirmed",
  venueTimeZone: "Asia/Bangkok", city: "Bangkok"
};
const ev = (over) => Object.assign({}, base, over);

const tew = ev({
  publicId: "tew-01", artistIds: ["tew"], venueName: "Upper House BKK",
  startAt: "2026-10-12T22:00:00+07:00", endAt: "2026-10-13T00:00:00+07:00", serviceDate: "2026-10-12"
});
const tewLater = ev({
  publicId: "tew-02", artistIds: ["tew"], venueName: "House of Savoy",
  startAt: "2026-10-16T22:00:00+07:00", endAt: "2026-10-17T00:00:00+07:00", serviceDate: "2026-10-16"
});
const norm = (events, opts) => S.normalize({ events }, opts);
const pick = (events, id, iso) => S.selectForArtist(norm(events), id, at(iso));

test("before start: upcoming with the earliest future set", () => {
  const r = pick([tewLater, tew], "tew", "2026-10-12T20:00:00+07:00");
  assert.equal(r.state, "upcoming");
  assert.equal(r.event.publicId, "tew-01");
});

test("exact start: playing now", () => {
  assert.equal(pick([tew], "tew", "2026-10-12T22:00:00+07:00").state, "live");
});

test("during the set: playing now", () => {
  assert.equal(pick([tew], "tew", "2026-10-12T23:30:00+07:00").state, "live");
});

test("exact end: moves to the next occurrence", () => {
  const r = pick([tew, tewLater], "tew", "2026-10-13T00:00:00+07:00");
  assert.equal(r.state, "upcoming");
  assert.equal(r.event.publicId, "tew-02");
});

test("exact end with nothing after: empty state", () => {
  const r = pick([tew], "tew", "2026-10-13T00:00:00+07:00");
  assert.equal(r.state, "none");
  assert.equal(r.event, null);
});

test("an artist with no occurrences is empty, not available", () => {
  assert.equal(pick([tew], "mawon", "2026-10-12T20:00:00+07:00").state, "none");
});

test("tonight follows the approved service date in venue time", () => {
  const n = norm([tew]).events[0];
  assert.equal(S.isTonight(n, at("2026-10-12T20:00:00+07:00")), true);
  assert.equal(S.isTonight(n, at("2026-10-11T23:59:00+07:00")), false);
});

test("a post-midnight set belongs to the previous night only when the owner says so", () => {
  const late = ev({
    publicId: "late-01", artistIds: ["ossy"], venueName: "House of Savoy",
    startAt: "2026-10-13T00:30:00+07:00", endAt: "2026-10-13T02:00:00+07:00", serviceDate: "2026-10-12"
  });
  const noService = ev({
    publicId: "late-02", artistIds: ["ossy"], venueName: "House of Savoy",
    startAt: "2026-10-13T00:30:00+07:00", endAt: "2026-10-13T02:00:00+07:00"
  });
  const now = at("2026-10-12T21:00:00+07:00");
  assert.equal(S.isTonight(norm([late]).events[0], now), true);
  assert.equal(S.isTonight(norm([noService]).events[0], now), false);
});

test("venue time zone governs the date: Brisbane", () => {
  const bne = ev({
    publicId: "bne-01", artistIds: ["mawon"], venueName: "Example Hall", city: "Brisbane",
    venueTimeZone: "Australia/Brisbane",
    startAt: "2026-11-07T21:00:00+10:00", endAt: "2026-11-07T23:00:00+10:00", serviceDate: "2026-11-07"
  });
  const n = norm([bne]).events[0];
  assert.equal(S.formatDateTime(n.startMs, n.venueTimeZone, "en"), "Sat 7 Nov 2026, 21:00 AEST");
  assert.equal(S.localDate(n.startMs, n.venueTimeZone), "2026-11-07");
  // 18:00 in Bangkok is already the 7th in Brisbane, same day in both
  assert.equal(S.isTonight(n, at("2026-11-07T06:00:00+07:00")), true);
  // 22:00 on the 6th in Bangkok is 01:00 on the 7th in Brisbane
  assert.equal(S.isTonight(n, at("2026-11-06T22:00:00+07:00")), true);
});

test("absolute time is formatted in venue time regardless of the viewer's zone", () => {
  const n = norm([tew]).events[0];
  assert.equal(S.formatDateTime(n.startMs, n.venueTimeZone, "en"), "Mon 12 Oct 2026, 22:00 ICT");
  assert.equal(S.formatTime(n.endMs, n.venueTimeZone), "00:00 ICT");
  assert.match(S.formatDateTime(n.startMs, n.venueTimeZone, "th"), /12 ต\.ค\. 2026, 22:00 ICT$/);
});

test("weekdays are derived, not hand-written: 29 and 30 Aug 2026", () => {
  assert.equal(S.formatDate("2026-08-29", "en"), "Sat 29 Aug 2026");
  assert.equal(S.formatDate("2026-08-30", "en"), "Sun 30 Aug 2026");
  assert.equal(S.formatDate("2025-10-25", "en"), "Sat 25 Oct 2025");
  assert.equal(S.formatDate("2026-05-24", "en"), "Sun 24 May 2026");
});

test("shared bill: one occurrence serves every listed artist", () => {
  const shared = ev({
    publicId: "shared-01", artistIds: ["tew", "maxlerr"], venueName: "Upper House BKK",
    startAt: "2026-10-12T22:00:00+07:00", endAt: "2026-10-13T00:00:00+07:00"
  });
  const n = norm([shared]);
  assert.equal(n.events.length, 1);
  const now = at("2026-10-12T20:00:00+07:00");
  assert.equal(S.selectForArtist(n, "tew", now).event.publicId, "shared-01");
  assert.equal(S.selectForArtist(n, "maxlerr", now).event.publicId, "shared-01");
  assert.equal(n.conflicts.length, 0);
});

test("duplicates, malformed times and unknown artists are rejected", () => {
  const n = norm([
    tew,
    Object.assign({}, tew),
    ev({ publicId: "no-offset", artistIds: ["ossy"], venueName: "X", startAt: "2026-10-12T22:00:00", endAt: "2026-10-13T00:00:00" }),
    ev({ publicId: "backwards", artistIds: ["ossy"], venueName: "X", startAt: "2026-10-13T00:00:00+07:00", endAt: "2026-10-12T22:00:00+07:00" }),
    ev({ publicId: "zero-length", artistIds: ["ossy"], venueName: "X", startAt: "2026-10-12T22:00:00+07:00", endAt: "2026-10-12T22:00:00+07:00" }),
    ev({ publicId: "stranger", artistIds: ["someone-else"], venueName: "X", startAt: "2026-10-12T22:00:00+07:00", endAt: "2026-10-13T00:00:00+07:00" }),
    ev({ publicId: "bad-zone", artistIds: ["ossy"], venueName: "X", venueTimeZone: "Bangkok", startAt: "2026-10-12T22:00:00+07:00", endAt: "2026-10-13T00:00:00+07:00" }),
    ev({ publicId: "no-venue", artistIds: ["ossy"], venueName: " ", startAt: "2026-10-12T22:00:00+07:00", endAt: "2026-10-13T00:00:00+07:00" }),
    null
  ]);
  assert.deepEqual(n.events.map((e) => e.publicId), ["tew-01"]);
  assert.deepEqual(n.rejected.map((r) => r.reason), [
    "duplicate", "bad-time", "end-not-after-start", "end-not-after-start",
    "unknown-artist", "bad-timezone", "no-venue", "not-an-object"
  ]);
});

test("private and unapproved occurrences never pass", () => {
  const n = norm([
    Object.assign({}, tew, { publicId: "private", public: false }),
    Object.assign({}, tew, { publicId: "pending", approved: false })
  ]);
  assert.equal(n.events.length, 0);
  assert.deepEqual(n.rejected.map((r) => r.reason), ["not-public", "not-approved"]);
});

test("fixture and live are isolated: demo data needs explicit preview mode", () => {
  const demo = Object.assign({}, tew, { isDemo: true });
  assert.equal(norm([demo]).events.length, 0);
  assert.equal(norm([demo]).rejected[0].reason, "demo-outside-preview");
  assert.equal(norm([demo], { allowDemo: true }).events[0].isDemo, true);
});

test("only allowlisted fields and https links reach the page", () => {
  const leaky = Object.assign({}, tew, {
    notes: "fee 40k", invitees: ["a@example.com"], budget: 40000, privateLink: "https://example.com/x",
    ticketUrl: "javascript:alert(1)",
    officialDetailsUrl: "https://www.instagram.com/certified_v10/",
    verifiedMapUrl: "https://evil.example/maps"
  });
  const e = norm([leaky]).events[0];
  for (const key of ["notes", "invitees", "budget", "privateLink"]) assert.equal(key in e, false);
  assert.equal(e.ticketUrl, null);
  assert.equal(e.verifiedMapUrl, null);
  assert.equal(e.officialDetailsUrl, "https://www.instagram.com/certified_v10/");
  assert.equal(S.safeUrl("http://www.instagram.com/x"), null);
  assert.equal(S.safeUrl("https://notinstagram.com/x"), null);
});

test("overlapping confirmed sets for one artist are a conflict, not two live sets", () => {
  const clash = ev({
    publicId: "tew-clash", artistIds: ["tew"], venueName: "Ratch Hour",
    startAt: "2026-10-12T23:00:00+07:00", endAt: "2026-10-13T01:00:00+07:00"
  });
  const n = norm([tew, clash]);
  assert.equal(n.conflicts.length, 1);
  assert.equal(S.selectForArtist(n, "tew", at("2026-10-12T20:00:00+07:00")).state, "conflict");
  // other artists are unaffected, and the conflict clears once both have ended
  assert.equal(S.selectForArtist(n, "ossy", at("2026-10-12T20:00:00+07:00")).state, "none");
  assert.equal(S.selectForArtist(n, "tew", at("2026-10-13T01:00:00+07:00")).state, "none");
});

test("back-to-back sets do not conflict", () => {
  const after = ev({
    publicId: "tew-after", artistIds: ["tew"], venueName: "Ratch Hour",
    startAt: "2026-10-13T00:00:00+07:00", endAt: "2026-10-13T01:00:00+07:00"
  });
  assert.equal(norm([tew, after]).conflicts.length, 0);
});

test("cancelled and postponed sets leave next-set selection but keep a notice", () => {
  const cancelled = Object.assign({}, tew, { status: "cancelled" });
  let r = pick([cancelled, tewLater], "tew", "2026-10-12T20:00:00+07:00");
  assert.equal(r.state, "upcoming");
  assert.equal(r.event.publicId, "tew-02");
  assert.equal(r.notice.publicId, "tew-01");
  r = pick([cancelled], "tew", "2026-10-12T22:30:00+07:00");
  assert.equal(r.state, "none");
  assert.equal(r.notice.status, "cancelled");
  r = pick([Object.assign({}, tew, { status: "postponed" })], "tew", "2026-10-12T20:00:00+07:00");
  assert.equal(r.state, "none");
  assert.equal(r.notice.status, "postponed");
  // a cancelled set that sits after the chosen one is not shown as a notice
  r = pick([tew, Object.assign({}, tewLater, { status: "cancelled" })], "tew", "2026-10-12T20:00:00+07:00");
  assert.equal(r.event.publicId, "tew-01");
  assert.equal(r.notice, null);
});

test("an unreadable feed is invalid, never an empty schedule", () => {
  assert.equal(S.normalize(null).invalid, true);
  assert.equal(S.normalize({ events: "none" }).invalid, true);
  assert.equal(S.normalize({ events: [] }).invalid, false);
});

test("countdown: days and hours above 24h, hours and minutes below, never negative", () => {
  const h = 3600000, m = 60000;
  assert.deepEqual(S.countdownParts(2 * h), { kind: "hours", h: 2, m: 0 });
  assert.deepEqual(S.countdownParts(59 * m + 1), { kind: "hours", h: 1, m: 0 });
  assert.deepEqual(S.countdownParts(26 * h), { kind: "days", d: 1, h: 2 });
  assert.deepEqual(S.countdownParts(24 * h), { kind: "days", d: 1, h: 0 });
  assert.deepEqual(S.countdownParts(59999), { kind: "soon" });
  assert.deepEqual(S.countdownParts(0), { kind: "now" });
  assert.deepEqual(S.countdownParts(-5000), { kind: "now" });
});

test("freshness: stale after 60 minutes, hard stale after 24 hours", () => {
  const now = at("2026-10-12T20:00:00+07:00");
  const m = 60000, h = 3600000;
  assert.equal(S.freshness(now - 10 * m, now), "fresh");
  assert.equal(S.freshness(now - 60 * m, now), "fresh");
  assert.equal(S.freshness(now - 61 * m, now), "stale");
  assert.equal(S.freshness(now - 24 * h, now), "stale");
  assert.equal(S.freshness(now - 25 * h, now), "hard-stale");
  assert.equal(S.freshness(null, now), "unknown");
});

test("next wake-up lands on the exact start and end, else the minute boundary", () => {
  const n = norm([tew]);
  assert.equal(S.nextWake(n, at("2026-10-12T21:59:30+07:00")), 30000);
  assert.equal(S.nextWake(n, at("2026-10-12T23:59:45+07:00")), 15000);
  assert.equal(S.nextWake(n, at("2026-10-12T20:00:20+07:00")), 40000);
  // nothing left to change once every set has ended
  assert.equal(S.nextWake(n, at("2026-10-13T00:00:00+07:00")), null);
  assert.equal(S.nextWake(norm([]), at("2026-10-12T20:00:00+07:00")), null);
});

test("next wake-up also covers the freshness thresholds", () => {
  const now = at("2026-10-12T20:00:00+07:00");
  assert.equal(S.nextWake(norm([]), now, now - 59 * 60000), 60001);
});

test("collective shows: confirmed, flagged and not yet ended", () => {
  const show = ev({
    publicId: "show-01", artistIds: S.ARTIST_IDS.slice(), venueName: "Example Venue", isCollectiveShow: true,
    startAt: "2026-10-17T21:00:00+07:00", endAt: "2026-10-18T02:00:00+07:00"
  });
  const n = norm([tew, show]);
  assert.deepEqual(S.collectiveShows(n, at("2026-10-12T20:00:00+07:00")).map((e) => e.publicId), ["show-01"]);
  assert.equal(S.collectiveShows(n, at("2026-10-18T02:00:00+07:00")).length, 0);
});
