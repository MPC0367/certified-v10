/* ============================================================
   CERTIFIED_V10 — sub-page runtime (artist, sets, events, booking,
   internships). Vanilla JS, no dependencies. The Thai dictionary
   above this file is the homepage's, plus the sub-page keys.
   ============================================================ */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, body = doc.body;
  var BASE = body.getAttribute("data-base") || "/";
  var params = new URLSearchParams(location.search);
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DICT = window.CV_TH || {};
  var LANG = "en";
  var dataEl = doc.getElementById("page-data");
  var PAGE = {};
  try { PAGE = dataEl ? JSON.parse(dataEl.textContent) : {}; } catch (e) { PAGE = {}; }

  /* strings the script writes itself: [English, Thai] */
  var S = {
    next: ["Next set", "งานถัดไป"], live: ["Now playing", "กำลังเล่นอยู่"], until: ["On now — until {t}", "กำลังเล่น — ถึง {t}"],
    none: ["No set announced", "ยังไม่ประกาศงาน"], demo: ["Demo", "ตัวอย่าง"], confirmed: ["Confirmed", "ยืนยันแล้ว"],
    tba: ["Set time to be announced", "รอประกาศเวลาเซ็ต"], doors: ["Doors {t}", "ประตูเปิด {t}"],
    d: ["d", "วัน"], h: ["h", "ชม."], m: ["m", "น."], s: ["s", "วิ"],
    tonight: ["Tonight", "คืนนี้"], upcoming: ["Upcoming", "เร็ว ๆ นี้"], past: ["Past", "จบแล้ว"],
    doorsIn: ["Doors in", "ประตูเปิดอีก"], doorsOpen: ["Doors open — set times not announced", "ประตูเปิดแล้ว — ยังไม่ประกาศเวลาเซ็ต"],
    onToday: ["On today", "วันนี้มีงาน"], over: ["This date has passed", "วันงานผ่านไปแล้ว"],
    updated: ["Updated {d}", "อัปเดต {d}"],
    posterPeriod: ["Schedule", "ตารางงาน"], posterDemo: ["Demo data", "ข้อมูลตัวอย่าง"], posterMore: ["+{n} more dates on the site", "+ อีก {n} วันบนเว็บไซต์"],
    posterFoot: ["Drawn from the schedule data", "สร้างจากข้อมูลตารางงาน"],
    posterAlt: ["{a} schedule poster, {p}. The same dates are listed beside it.", "โปสเตอร์ตารางงานของ {a} ช่วง {p} รายการเดียวกันอยู่ข้าง ๆ"],
    noDates: ["No dates announced yet.", "ยังไม่มีการประกาศวันเล่น"],
    play: ["Play set", "เล่นเซ็ต"], playing: ["Playing — {t}", "กำลังเล่น — {t}"], pause: ["Pause", "หยุดชั่วคราว"], resume: ["Resume", "เล่นต่อ"],
    copied: ["Message copied. Paste it into the chat that just opened.", "คัดลอกข้อความแล้ว วางในแชตที่เพิ่งเปิดได้เลย"],
    copiedOnly: ["Message copied.", "คัดลอกข้อความแล้ว"],
    copyFail: ["Copy didn't work here — select the message above and copy it.", "คัดลอกไม่สำเร็จ — เลือกข้อความด้านบนแล้วคัดลอกเอง"],
    lineOpened: ["LINE opened with your message. Press send in LINE to deliver it. This is not a confirmed booking yet.", "เปิด LINE พร้อมข้อความแล้ว กดส่งใน LINE เพื่อส่งถึงทีม ยังไม่ถือเป็นการยืนยันการจอง"],
    errTitle: ["Please check {n} field(s):", "กรุณาตรวจสอบ {n} ช่อง:"],
    required: ["This is required.", "กรุณากรอกช่องนี้"], email: ["Enter an email address like name@example.com.", "กรอกอีเมลให้ถูกต้อง เช่น name@example.com"],
    pickOne: ["Choose at least one option.", "เลือกอย่างน้อยหนึ่งตัวเลือก"], dateNeeded: ["Add a date, or tick “Date not confirmed”.", "ใส่วันที่ หรือติ๊ก “ยังไม่ระบุวัน”"],
    pastDate: ["This date has already passed.", "วันที่นี้ผ่านไปแล้ว"],
    intakeOpen: ["Applications are open", "เปิดรับสมัครอยู่"], intakeClosed: ["Applications are closed", "ปิดรับสมัครแล้ว"],
    intakeOpenD: ["Apply by email using the details below.", "สมัครทางอีเมลตามรายละเอียดด้านล่าง"],
    intakeClosedD: ["Applications are currently closed. Follow CERTIFIED for the next intake.", "ขณะนี้ปิดรับสมัคร ติดตาม CERTIFIED เพื่อรอรอบถัดไป"]
  };
  function s(k) { var v = S[k]; return v ? (LANG === "th" ? v[1] : v[0]) : k; }
  function t(key, fb) { return LANG === "th" && DICT[key] ? DICT[key] : fb; }

  /* ---------- language ---------- */
  var langHooks = [];
  /* the address bar says which language is on screen, so a reload, back or a shared link reopens the same one */
  function langURL() {
    if (LANG === "th") params.set("lang", "th"); else params.delete("lang");
    var q = params.toString();
    try { history.replaceState(history.state, "", location.pathname + (q ? "?" + q : "") + location.hash); } catch (e) {}
  }
  function setLang(lang, fromUser) {
    LANG = lang === "th" ? "th" : "en";
    body.setAttribute("data-lang", LANG);
    root.setAttribute("lang", LANG);
    doc.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (el.__en === undefined) el.__en = el.textContent;
      el.textContent = (LANG === "th" && DICT[key]) ? DICT[key] : el.__en;
    });
    doc.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (el.__enAlt === undefined) el.__enAlt = el.getAttribute("alt") || "";
      el.setAttribute("alt", (LANG === "th" && DICT[key]) ? DICT[key] : el.__enAlt);
    });
    doc.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (el.__enAria === undefined) el.__enAria = el.getAttribute("aria-label") || "";
      el.setAttribute("aria-label", (LANG === "th" && DICT[key]) ? DICT[key] : el.__enAria);
    });
    doc.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (el.__enPh === undefined) el.__enPh = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", (LANG === "th" && DICT[key]) ? DICT[key] : el.__enPh);
    });
    if (fromUser) {
      try { localStorage.setItem("cv-lang", LANG); } catch (e) {}
      langURL();
    }
    langHooks.forEach(function (f) { try { f(); } catch (e) {} });
  }
  var langBtn = doc.getElementById("lang-toggle");
  if (langBtn) langBtn.addEventListener("click", function () { setLang(LANG === "en" ? "th" : "en", true); });

  /* ---------- time helpers (venue local time; Bangkok) ---------- */
  function fmt(ms, opts, tz) {
    opts = Object.assign({}, opts); opts.timeZone = tz || "Asia/Bangkok";
    try { return new Intl.DateTimeFormat(LANG === "th" ? "th-TH-u-ca-gregory-nu-latn" : "en-GB", opts).format(ms); }
    catch (e) { return ""; }
  }
  function hhmm(ms, tz) { return fmt(ms, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, tz); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function parts(ms) {
    var sec = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(sec / 86400); sec -= d * 86400;
    var h = Math.floor(sec / 3600); sec -= h * 3600;
    var m = Math.floor(sec / 60); sec -= m * 60;
    return { d: d, h: h, m: m, s: sec };
  }
  function countHTML(ms) {
    var p = parts(ms);
    return (p.d > 0 ? p.d + "<em>" + s("d") + "</em>" : "") + pad2(p.h) + "<em>" + s("h") + "</em>" + pad2(p.m) + "<em>" + s("m") + "</em>" + pad2(p.s) + "<em>" + s("s") + "</em>";
  }
  function countText(ms) {
    var p = parts(ms);
    return (p.d > 0 ? p.d + s("d") + " " : "") + p.h + s("h") + " " + p.m + s("m");
  }

  /* ---------- the homepage's demo club schedule (same generator, same output) ---------- */
  function bkkAt(dayOffset, hh, mm) {
    var n = new Date(Date.now() + 7 * 3600000);
    return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + dayOffset, hh - 7, mm);
  }
  function demoSchedule() {
    var half = 30 * 60000;
    var liveStart = Math.floor(Date.now() / half) * half - half;
    return [
      { dj: "mawon", venue: "House of Savoy", start: liveStart, end: liveStart + 4 * half },
      { dj: "mawon", venue: "Salone", start: bkkAt(3, 23, 0), end: bkkAt(4, 1, 0) },
      { dj: "ossy", venue: "Ratch Hour", start: bkkAt(2, 22, 30), end: bkkAt(3, 0, 30) },
      { dj: "tew", venue: "Upper House", start: bkkAt(1, 22, 0), end: bkkAt(2, 0, 0) },
      { dj: "wichaya", venue: "Echo", start: bkkAt(4, 22, 0), end: bkkAt(5, 0, 0) }
    ];
  }
  /* one artist's dates: confirmed public events + the labelled demo club dates */
  function artistDates(id) {
    var now = Date.now(), out = [];
    (PAGE.events || []).forEach(function (e) {
      var start = Date.parse(e.start);
      if (isNaN(start)) return;
      var dayEnd = start + (e.allDay ? 86400000 : 12 * 3600000);
      if (dayEnd <= now) return;
      out.push({ status: "confirmed", start: start, title: e.title, venue: e.venue, url: e.url, doors: !e.allDay, allDay: !!e.allDay });
    });
    try {
      demoSchedule().forEach(function (d) {
        if (d.dj !== id || !(d.end > now)) return;
        out.push({ status: "demo", start: d.start, end: d.end, title: d.venue, venue: d.venue, live: d.start <= now });
      });
    } catch (e) {}
    out.sort(function (a, b) { return a.start - b.start; });
    return out;
  }

  /* ---------- schedule poster (SVG, drawn from the same data as the list) ---------- */
  function esc(x) { return String(x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function posterSVG(a, items) {
    var W = 1080, H = 1350, rows = items.slice(0, 5), more = items.length - rows.length;
    var anyDemo = items.some(function (i) { return i.status === "demo"; });
    var lh = 112, lw = Math.min(900, lh * a.logo.w / a.logo.h); lh = lw * a.logo.h / a.logo.w;
    var first = items[0], last = items[items.length - 1];
    var period = items.length ? (fmt(first.start, { day: "numeric", month: "short" }) + " — " + fmt(last.start, { day: "numeric", month: "short", year: "numeric" })) : "";
    var o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(s("posterAlt").replace("{a}", a.name).replace("{p}", period)) + '">');
    o.push('<defs><radialGradient id="pg-' + a.id + '" cx="88%" cy="6%" r="70%"><stop offset="0" stop-color="#FF3117" stop-opacity=".34"/><stop offset="1" stop-color="#FF3117" stop-opacity="0"/></radialGradient></defs>');
    o.push('<rect width="' + W + '" height="' + H + '" fill="#0B0B0C"/><rect width="' + W + '" height="' + H + '" fill="url(#pg-' + a.id + ')"/>');
    o.push('<text x="80" y="96" fill="#8E8B84" font-family="Chakra Petch, Kanit, sans-serif" font-size="26" font-weight="600" letter-spacing="5">CERTIFIED_V10 · ' + esc(s("posterPeriod").toUpperCase()) + "</text>");
    o.push('<image href="' + esc(BASE + a.logo.src) + '" x="80" y="142" width="' + lw.toFixed(1) + '" height="' + lh.toFixed(1) + '"/>');
    o.push('<text x="80" y="' + (142 + lh + 66).toFixed(0) + '" fill="#FF3117" font-family="Chakra Petch, Kanit, sans-serif" font-size="30" font-weight="600" letter-spacing="4">' + esc(period.toUpperCase()) + "</text>");
    var y0 = 142 + lh + 120;
    if (!rows.length) {
      o.push('<text x="80" y="' + (y0 + 90) + '" fill="#8E8B84" font-family="Anuphan, Kanit, sans-serif" font-size="40">' + esc(s("noDates")) + "</text>");
    }
    rows.forEach(function (r, i) {
      var y = y0 + i * 150;
      o.push('<line x1="80" x2="1000" y1="' + y + '" y2="' + y + '" stroke="#2c2c31" stroke-width="2"/>');
      o.push('<text x="80" y="' + (y + 92) + '" fill="#EDEAE3" font-family="Anton, Kanit, sans-serif" font-size="92">' + esc(fmt(r.start, { day: "2-digit" })) + "</text>");
      o.push('<text x="80" y="' + (y + 128) + '" fill="#8E8B84" font-family="Chakra Petch, Kanit, sans-serif" font-size="24" font-weight="600" letter-spacing="3">' + esc((fmt(r.start, { weekday: "short" }) + " " + fmt(r.start, { month: "short" })).toUpperCase()) + "</text>");
      var title = r.title.toUpperCase();
      var fs = title.length > 18 ? 52 : 64;
      o.push('<text x="270" y="' + (y + 76) + '" fill="#EDEAE3" font-family="Anton, Kanit, sans-serif" font-size="' + fs + '">' + esc(title) + "</text>");
      var sub = r.status === "confirmed" ? (r.venue + (r.doors ? " · " + s("doors").replace("{t}", hhmm(r.start)) : "")) : (r.live ? s("until").replace("{t}", hhmm(r.end)) : hhmm(r.start) + " – " + hhmm(r.end));
      o.push('<text x="270" y="' + (y + 122) + '" fill="#8E8B84" font-family="Chakra Petch, Kanit, sans-serif" font-size="26" font-weight="500" letter-spacing="2">' + esc(sub.toUpperCase()) + "</text>");
      var lab = (r.status === "confirmed" ? s("confirmed") : s("demo")).toUpperCase();
      var tw = 30 + lab.length * 17;
      o.push('<rect x="' + (1000 - tw) + '" y="' + (y + 40) + '" width="' + tw + '" height="46" fill="none" stroke="' + (r.status === "confirmed" ? "#FF3117" : "#5b5a56") + '" stroke-width="2"' + (r.status === "demo" ? ' stroke-dasharray="7 6"' : "") + "/>");
      o.push('<text x="' + (1000 - tw / 2) + '" y="' + (y + 72) + '" text-anchor="middle" fill="' + (r.status === "confirmed" ? "#FF3117" : "#8E8B84") + '" font-family="Chakra Petch, Kanit, sans-serif" font-size="22" font-weight="700" letter-spacing="3">' + esc(lab) + "</text>");
    });
    if (rows.length) o.push('<line x1="80" x2="1000" y1="' + (y0 + rows.length * 150) + '" y2="' + (y0 + rows.length * 150) + '" stroke="#2c2c31" stroke-width="2"/>');
    if (more > 0) o.push('<text x="80" y="' + (y0 + rows.length * 150 + 54) + '" fill="#8E8B84" font-family="Chakra Petch, Kanit, sans-serif" font-size="24" letter-spacing="2">' + esc(s("posterMore").replace("{n}", more)) + "</text>");
    /* a short list leaves room: fill it with the outlined word the footer marquee uses */
    var listEnd = y0 + Math.max(rows.length, 1) * 150 + (more > 0 ? 70 : 0);
    if (listEnd < 1010) {
      o.push('<text x="540" y="1196" text-anchor="middle" fill="none" stroke="rgba(237,234,227,.16)" stroke-width="2.5" font-family="Anton, Kanit, sans-serif" font-size="' + (LANG === "th" ? 190 : 230) + '" textLength="920" lengthAdjust="spacingAndGlyphs">' + esc(s("posterPeriod").toUpperCase()) + "</text>");
    }
    if (anyDemo) {
      o.push('<g transform="translate(820 92) rotate(-8)"><rect x="-150" y="-40" width="300" height="72" fill="none" stroke="#FF3117" stroke-width="5"/><text x="0" y="10" text-anchor="middle" fill="#FF3117" font-family="Chakra Petch, Kanit, sans-serif" font-size="30" font-weight="700" letter-spacing="5">' + esc(s("posterDemo").toUpperCase()) + "</text></g>");
    }
    o.push('<line x1="80" x2="1000" y1="1254" y2="1254" stroke="#2c2c31" stroke-width="2"/>');
    o.push('<text x="80" y="1300" fill="#5b5a56" font-family="Chakra Petch, Kanit, sans-serif" font-size="22" letter-spacing="3">' + esc(s("posterFoot").toUpperCase()) + "</text>");
    o.push('<text x="1000" y="1300" text-anchor="end" fill="#5b5a56" font-family="Chakra Petch, Kanit, sans-serif" font-size="22" letter-spacing="3">' + esc(s("updated").replace("{d}", fmt(Date.parse(PAGE.updated || "") || Date.now(), { day: "numeric", month: "short", year: "numeric" })).toUpperCase()) + "</text>");
    o.push("</svg>");
    return o.join("");
  }

  /* ---------- artist page ---------- */
  function artistPage() {
    var a = PAGE.artist; if (!a) return;
    var list = doc.getElementById("slist"), posterBtn = doc.getElementById("poster-btn"), posterHost = doc.getElementById("poster-host");
    var dialog = doc.getElementById("poster-dialog"), dialogFig = doc.getElementById("poster-dialog-fig");
    var nextHost = doc.getElementById("next-host");
    var lastKey = "";
    function render() {
      var items = artistDates(a.id);
      var key = LANG + "|" + items.map(function (i) { return i.status + i.start + (i.live ? 1 : 0); }).join(",");
      if (key === lastKey) return;
      lastKey = key;
      if (list) {
        if (!items.length) { list.innerHTML = '<li class="sched__empty">' + esc(s("noDates")) + "</li>"; }
        else list.innerHTML = items.map(function (r) {
          var day = fmt(r.start, { weekday: "short", day: "numeric", month: "short" });
          var time = r.status === "confirmed" ? (r.doors ? s("doors").replace("{t}", hhmm(r.start)) + " · " + s("tba") : s("tba")) : (r.live ? s("until").replace("{t}", hhmm(r.end)) : hhmm(r.start) + " – " + hhmm(r.end));
          var venue = r.url ? '<a href="' + esc(r.url) + '">' + esc(r.title) + "</a>" : esc(r.title);
          var sub = r.status === "confirmed" ? '<p class="slist__time meta">' + esc(r.venue) + "</p>" : "";
          return '<li class="slist__row' + (r.live ? " is-live" : "") + '"><p class="slist__date">' + esc(day) + "</p>" +
            '<div><p class="slist__venue">' + venue + "</p>" + sub + '<p class="slist__time meta">' + esc(time) + "</p></div>" +
            '<span class="tag ' + (r.status === "confirmed" ? "tag--red" : "tag--muted") + '">' + esc(r.status === "confirmed" ? s("confirmed") : s("demo")) + "</span></li>";
        }).join("");
      }
      if (posterHost) posterHost.innerHTML = posterSVG(a, items);
      if (dialog && dialog.open && dialogFig) dialogFig.innerHTML = posterSVG(a, items);
    }
    function tickNext() {
      if (!nextHost) return;
      var now0 = Date.now(), shown = null;
      nextHost.querySelectorAll(".next[data-end]").forEach(function (b) {
        var live = !shown && +b.getAttribute("data-end") > now0;
        if (live) shown = b;
        b.hidden = !live;
      });
      var none = nextHost.querySelector(".next--none");
      if (none) none.hidden = !!shown;
      if (!shown) return;
      var el = shown.querySelector("[data-count]");
      if (!el) return;
      var start = +el.getAttribute("data-count"), now = Date.now(), lab = shown.querySelector(".next__label");
      if (lab) lab.hidden = now >= start;
      if (now < start) el.innerHTML = '<span class="sr">' + esc(s("doorsIn")) + " " + esc(countText(start - now)) + '</span><span aria-hidden="true">' + countHTML(start - now) + "</span>";
      else { el.textContent = s("doorsOpen"); el.classList.add("is-open"); }
    }
    render(); tickNext();
    langHooks.push(function () { lastKey = ""; render(); tickNext(); });
    every(function () { render(); tickNext(); });

    if (posterBtn && dialog && typeof dialog.showModal === "function") {
      var closeBtn = doc.getElementById("poster-close");
      posterBtn.addEventListener("click", function () {
        dialogFig.innerHTML = posterSVG(a, artistDates(a.id));
        dialog.showModal();
        if (closeBtn) closeBtn.focus();
      });
      if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });
      dialog.addEventListener("click", function (e) { if (e.target === dialog || e.target.classList.contains("lightbox__inner")) dialog.close(); });
      dialog.addEventListener("close", function () { posterBtn.focus(); });
    } else if (posterBtn) {
      posterBtn.addEventListener("click", function () { var l = doc.getElementById("dates"); if (l) l.scrollIntoView(); });
    }
  }

  /* ---------- YouTube sets: one player at a time, started by the visitor ---------- */
  /* ---------- background: the field drifts as the page scrolls; while a set plays it comes alive.
     The page can't hear a YouTube player (it is another site's frame), so a set's loudness is measured
     once ahead of time (tools/levels.mjs -> data/levels/<id>.json) and lined up with the player's position:
     brightness follows the loudness, the swell follows the bass. A set without a loudness file falls back to
     a steady pulse while it plays. ---------- */
  /* A soft field of red light behind the page: five overlapping colour fields and two drifting pools of black,
     each with a gaussian falloff, drawn on a small canvas and stretched to the window so it stays smooth and cheap.
     Every field wanders on its own slow, uneven path (two out-of-step waves per axis, random start each visit).
     draw(tau, t, e, A): tau is how far along the drift is; e (0–1) lights the field up while a set plays, and
     A = { loud, bass, mid, high, kick } (each 0–1) is the music right now:
       kick  -> the core flashes and the dark pools pull back for a moment (the punch)
       bass  -> the big red fields swell
       mid   -> the ember field warms the light
       high  -> a fine shimmer in the positions
       loud  -> overall brightness */
  function bgField(cv) {
    var ctx = cv && cv.getContext && cv.getContext("2d");
    if (!ctx) return null;
    /* r, g, b, strength, radius (share of the long side), home x, home y, swing x, swing y, speed x, speed y */
    var F = [
      [255, 49, 23, .10, .52, .80, .16, .30, .30, 1.3, .9],
      [150, 16, 8, .19, .66, .16, .80, .32, .30, .8, 1.1],
      [255, 118, 60, .04, .40, .58, .52, .26, .30, 1.7, 1.4],
      [104, 8, 30, .15, .72, .30, .22, .28, .26, 1.1, .7],
      [194, 31, 14, .08, .48, .86, .86, .22, .28, .6, 1.6],
      [11, 11, 12, .70, .52, .55, .40, .30, .28, .9, 1.2],
      [11, 11, 12, .62, .46, .30, .65, .26, .24, 1.4, .8],
      [11, 11, 12, .55, .40, .75, .70, .24, .26, 1.2, 1.0]
    ];
    var PH = F.map(function () { return [Math.random() * 6.283, Math.random() * 6.283, Math.random() * 6.283, Math.random() * 6.283]; });
    var G = new Float32Array(257);
    for (var i = 0; i < 257; i++) G[i] = Math.exp(-i / 32 * 3);
    var w = 0, h = 0, img = null;
    function fit() {
      var W = window.innerWidth, H = window.innerHeight, s = W > 900 ? 10 : 7;
      w = Math.max(24, Math.ceil(W / s)); h = Math.max(24, Math.ceil(H / s));
      cv.width = w; cv.height = h;
      img = ctx.createImageData(w, h);
    }
    fit();
    function draw(tau, t, e, A) {
      A = A || { loud: 0, bass: 0, mid: 0, high: 0, kick: 0 };
      var T = Math.PI * 2, m = Math.max(w, h), q = [], d = img.data, o = 0, x, y, k;
      for (k = 0; k < F.length; k++) {
        var f = F[k], ph = PH[k], ax = T * tau * f[9], ay = T * tau * f[10], dark = f[0] < 20;
        var jit = e * .006 * A.high;
        var cx = (f[5] + f[7] * (.62 * Math.sin(ax + ph[0]) + .38 * Math.sin(ax * 1.618 + ph[1])) + e * .07 * Math.sin(t * .47 + k * 2.1) + jit * Math.sin(t * 37 + k * 5)) * w;
        var cy = (f[6] + f[8] * (.62 * Math.sin(ay + ph[2]) + .38 * Math.sin(ay * 1.618 + ph[3])) + e * .06 * Math.cos(t * .39 + k * 1.3) + jit * Math.cos(t * 41 + k * 3)) * h;
        var swell = dark ? -.25 * A.kick : k === 0 ? .3 * A.kick + .14 * A.bass : k === 2 ? .12 * A.mid : .34 * A.bass + .08 * A.kick;
        var r = f[4] * m * (1 + .12 * Math.sin((ax + ay) / 2 + ph[1]) + e * swell);
        var a = dark ? f[3] * (1 - e * (.25 + .6 * A.kick))
          : k === 0 ? f[3] * (1 + e * (.3 + .7 * A.loud + 3.2 * A.kick))
          : k === 2 ? f[3] * (1 + e * (.3 + 3 * A.mid))
          : f[3] * (1 + e * (.3 + .8 * A.loud + .6 * A.bass + 1.1 * A.kick));
        q.push(cx, cy, 32 / (r * r), Math.min(.8, a), f[0], f[1], f[2]);
      }
      for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
          var R = 11, Gc = 11, B = 12;
          for (k = 0; k < q.length; k += 7) {
            var dx = x - q[k], dy = y - q[k + 1], j = (dx * dx + dy * dy) * q[k + 2];
            if (j >= 256) continue;
            var al = q[k + 3] * G[j | 0];
            R += (q[k + 4] - R) * al; Gc += (q[k + 5] - Gc) * al; B += (q[k + 6] - B) * al;
          }
          d[o++] = R; d[o++] = Gc; d[o++] = B; d[o++] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      /* the whole field punches brighter on a kick (a compositor filter: no extra drawing) */
      var punch = e * A.kick;
      cv.style.filter = punch > .02 ? "brightness(" + (1 + .5 * punch).toFixed(3) + ")" : "";
    }
    return { fit: fit, draw: draw };
  }
  /* The drift clock: a slow steady creep (a full wander every few minutes), nudged faster while the page scrolls.
     Idle it redraws about 25 times a second; while scrolling or playing, every frame. */
  var BG_IDLE = 1 / 200, BG_SCROLL = 0.06;
  var bg = (function () {
    var field = bgField(doc.querySelector(".bgfx canvas")), grain = doc.querySelector(".grain");
    var still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    var tau = Math.random() * 20, boost = 0, lastY = window.scrollY || 0, lastT = 0, lastDraw = 0;
    var e = 0, want = 0, source = null, live = false, lastPos = -1, lastKick = -1e9;
    var M = { loud: 0, bass: 0, mid: 0, high: 0, kick: 0 };
    /* per band: how fast a meter rises and falls (share of the gap closed each frame) */
    var UP = { loud: .5, bass: .6, mid: .4, high: .5 }, DOWN = { loud: .1, bass: .14, mid: .1, high: .2 };
    function at(arr, x) { var i = Math.floor(x), fr = x - i; return i >= 0 && i + 1 < arr.length ? (arr[i] * (1 - fr) + arr[i + 1] * fr) / 255 : 0; }
    function frame(now) {
      var dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0;
      lastT = now;
      var y = window.scrollY || root.scrollTop, dy = Math.abs(y - lastY);
      lastY = y;
      boost += (dy / Math.max(1, window.innerHeight) * BG_SCROLL - boost) * 0.15;
      e += (want - e) * 0.04;
      if (e < 0.002 && want === 0) e = 0;
      var src = source && e > 0 ? source() : null, lv = src && src.lv;
      live = !!lv;
      if (lv) {
        var x = src.t / lv.hop;
        ["loud", "bass", "mid", "high"].forEach(function (b) { var v = at(lv[b], x); M[b] += (v - M[b]) * (v > M[b] ? UP[b] : DOWN[b]); });
        /* any kick the playhead passed since the last frame fires the flash (a seek doesn't) */
        var p0 = lastPos >= 0 && x >= lastPos && x - lastPos < 25 ? Math.floor(lastPos) + 1 : Math.floor(x);
        /* at most three flashes a second (WCAG 2.3.1), whatever the drummer does */
        for (var i = p0; i <= Math.floor(x) && i < lv.kick.length; i++) if (lv.kick[i] && now - lastKick > 340) { M.kick = Math.max(M.kick, lv.kick[i] / 255); lastKick = now; }
        lastPos = x;
      } else {
        lastPos = -1;
        ["loud", "bass", "mid", "high"].forEach(function (b) { M[b] += (0 - M[b]) * 0.1; });
      }
      M.kick *= Math.exp(-dt / 0.14);
      tau += dt * (BG_IDLE + e * (.003 + .02 * M.loud)) + boost;
      if (grain) grain.style.opacity = live ? (0.05 + 0.07 * M.high * e).toFixed(3) : "";
      if (e > 0 || boost > 0.00005 || now - lastDraw > 38) {
        var t = now / 1000, A = M;
        if (!live && e > 0) {
          /* no sound map for this set: a gentle steady pulse, so the page still feels alive while it plays */
          var beat = Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.9), 3);
          A = { loud: .35 + .3 * beat, bass: .6 * beat, mid: .2, high: 0, kick: 0 };
        }
        field.draw(tau, t, e, A);
        lastDraw = now;
      }
      requestAnimationFrame(frame);
    }
    if (field) {
      field.draw(tau, 0, 0, null);
      /* reduced motion: the field holds still and doesn't react */
      if (!still) requestAnimationFrame(frame);
      window.addEventListener("resize", function () { field.fit(); field.draw(tau, 0, e, M); });
    }
    return {
      energy: function (v) { want = still ? 0 : v; },
      source: function (fn) { source = fn; },
      level: function () { return e; },
      reading: function () { return live ? { loud: M.loud, bass: M.bass, mid: M.mid, high: M.high, kick: M.kick } : null; }
    };
  })();
  window.__cvBg = bg;

  /* YouTube picks the stream from the size its player is laid out at — it ignores screen density, and its old
     quality settings (vq, setPlaybackQuality) no longer do anything. So each player is laid out at a standard large
     size and scaled down into its box: at least 1080p, more on dense or large screens, up to 4K. While YouTube's own
     controls show, the scale stays at 0.6 or more so they remain usable; the muted preview has none, so it goes all the way. */
  var STEPS = [1280, 1920, 2560, 3840];
  /* CSS zoom draws the player at the smaller size directly; scaling a picture of it instead (transform) can leave a
     hairline seam across the video on some screens, so transform is only the fallback for browsers without zoom */
  var ZOOM = !!(window.CSS && CSS.supports && CSS.supports("zoom", "0.5"));
  function fit(f, media, controls) {
    var w = media.clientWidth, h = media.clientHeight;
    if (!w || !h) return;
    var need = Math.max(1920, w * (window.devicePixelRatio || 1));
    var L = STEPS.filter(function (x) { return x >= need; })[0] || 3840;
    if (controls) while (L > w && w / L < 0.6) { var i = STEPS.indexOf(L); L = i > 0 ? STEPS[i - 1] : w; }
    if (L <= w) { f.style.width = f.style.height = f.style.transform = f.style.zoom = ""; return; }
    f.style.width = L + "px";
    f.style.height = Math.round(L * h / w) + "px";
    if (ZOOM) { f.style.transform = ""; f.style.zoom = String(w / L); }
    else { f.style.zoom = ""; f.style.transformOrigin = "0 0"; f.style.transform = "scale(" + (w / L) + ")"; }
  }
  function players() {
    var active = null, preview = null, mutedNote = doc.getElementById("lead-muted");
    var ctrl = doc.getElementById("lead-ctrl"), soundBtn = doc.getElementById("lead-sound"), pauseBtn = doc.getElementById("lead-pause");
    var lead = doc.querySelector("[data-yt][data-autoplay]");
    function post(f, o) { try { f.contentWindow.postMessage(JSON.stringify(o), "https://www.youtube-nocookie.com"); } catch (x) {} }
    function paintPause() {
      if (!pauseBtn || !preview) return;
      pauseBtn.textContent = s(preview.paused ? "resume" : "pause");
      pauseBtn.setAttribute("aria-pressed", preview.paused ? "true" : "false");
    }
    function start(btn, muted, at) {
      var id = btn.getAttribute("data-yt"), media = btn.parentNode, title = btn.getAttribute("data-title") || "";
      if (active) { active.frame.remove(); active.btn.hidden = false; bg.energy(0); }
      preview = null;
      if (ctrl) ctrl.hidden = true;
      /* enablejsapi: the player reports play/pause (and the preview's position) back to the page */
      var q = "autoplay=1&playsinline=1&rel=0&enablejsapi=1&origin=" + encodeURIComponent(location.origin);
      /* browsers only let a video start by itself with the sound off; the preview runs without YouTube's controls
         (it is scaled too far for them) and the page's own Play with sound / Pause buttons stand in */
      if (muted) q += "&mute=1&controls=0";
      if (at > 1) q += "&start=" + Math.floor(at);
      var f = doc.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?" + q;
      f.title = s("playing").replace("{t}", title);
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      btn.hidden = true;
      media.appendChild(f);
      f.addEventListener("load", function () { post(f, { event: "listening", id: 1, channel: "widget" }); });
      fit(f, media, !muted);
      if (!muted) { try { f.focus({ preventScroll: true }); } catch (x) { f.focus(); } }
      if (mutedNote) mutedNote.hidden = !muted;
      active = { media: media, frame: f, btn: btn, controls: !muted, id: id, t: at > 1 ? Math.floor(at) : 0, at: performance.now(), rate: 1, playing: false };
      if (muted) {
        preview = { frame: f, time: at || 0, paused: false };
        if (ctrl) ctrl.hidden = false;
        paintPause();
      }
    }
    /* on the sets page, every set opens in the big player at the top; the one it replaces returns to the grid */
    var leadSec = lead ? lead.closest(".setlead") : null, latestId = leadSec ? leadSec.getAttribute("data-latest") : "";
    function showInLead(id) {
      var card = doc.querySelector('.vgrid .vcard[data-set="' + id + '"]');
      if (!card || !leadSec) return false;
      var cb = card.querySelector("[data-yt]"), img = lead.querySelector("img"), len = lead.querySelector(".vcard__len");
      lead.setAttribute("data-yt", id);
      lead.setAttribute("data-title", cb.getAttribute("data-title") || "");
      lead.setAttribute("aria-label", cb.getAttribute("aria-label") || "");
      if (img) img.src = card.querySelector("img").getAttribute("src");
      if (len) len.textContent = card.querySelector(".vcard__len").textContent;
      leadSec.querySelectorAll(".setlead__set").forEach(function (b) { b.hidden = b.getAttribute("data-set") !== id; });
      leadSec.setAttribute("aria-labelledby", "lead-t-" + id);
      var kl = doc.getElementById("lead-k-latest"), kn = doc.getElementById("lead-k-now");
      if (kl) kl.hidden = id !== latestId;
      if (kn) kn.hidden = id === latestId;
      doc.querySelectorAll(".vgrid .vcard[data-set]").forEach(function (c) { c.hidden = c.getAttribute("data-set") === id; });
      return true;
    }
    var still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    doc.querySelectorAll("[data-yt]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (lead && btn !== lead && btn.closest(".vgrid") && showInLead(btn.getAttribute("data-yt"))) {
          start(lead, false);
          window.scrollTo({ top: 0, behavior: still ? "instant" : "smooth" });
          return;
        }
        start(btn, false);
      });
    });
    /* players report play/pause (the background follows it) and the preview's position,
       so Play with sound carries on from the same moment */
    /* loudness maps, fetched once per set; null when a set has none */
    var LV = {};
    function loadLevels(id) {
      if (id in LV || !window.fetch) return;
      LV[id] = null;
      if ((window.CV_LEVELS || []).indexOf(id) < 0) return;
      fetch(BASE + "data/levels/" + encodeURIComponent(id) + ".json").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || !j.loud) return;
        function bytes(b64) { var raw = atob(b64), out = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i); return out; }
        var loud = bytes(j.loud), zero = new Uint8Array(loud.length);
        LV[id] = { hop: j.hop || 0.05, loud: loud, bass: j.bass ? bytes(j.bass) : loud, mid: j.mid ? bytes(j.mid) : zero, high: j.high ? bytes(j.high) : zero, kick: j.kick ? bytes(j.kick) : zero };
      }, function () {});
    }
    /* where the playing set is right now (the player reports about four times a second; in between, count on) */
    bg.source(function () {
      var lv = active && active.playing && LV[active.id];
      if (!lv) return null;
      return { t: active.t + (performance.now() - active.at) / 1000 * active.rate, lv: lv };
    });
    window.addEventListener("message", function (e) {
      if (!active || e.source !== active.frame.contentWindow) return;
      var d; try { d = JSON.parse(e.data); } catch (x) { return; }
      if (!d || !d.info) return;
      if (preview && typeof d.info.currentTime === "number") preview.time = d.info.currentTime;
      if (typeof d.info.currentTime === "number") { active.t = d.info.currentTime; active.at = performance.now(); }
      if (typeof d.info.playbackRate === "number") active.rate = d.info.playbackRate;
      var st = d.info.playerState;
      if (st === 1) { active.playing = true; loadLevels(active.id); bg.energy(1); }
      else if (st === 0 || st === 2) { active.playing = false; bg.energy(0); }
      if (preview && (st === 1 || st === 2)) { preview.paused = st === 2; paintPause(); }
    });
    if (soundBtn) soundBtn.addEventListener("click", function () { if (lead) start(lead, false, preview ? preview.time : 0); });
    if (pauseBtn) pauseBtn.addEventListener("click", function () {
      if (!preview) return;
      preview.paused = !preview.paused;
      post(preview.frame, { event: "command", func: preview.paused ? "pauseVideo" : "playVideo", args: [] });
      paintPause();
    });
    langHooks.push(paintPause);
    window.addEventListener("resize", function () { if (active) fit(active.frame, active.media, active.controls); });
    /* the newest set on the sets page starts on arrival — not for reduced motion or data saver, where it waits for a tap */
    var calm = (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || (navigator.connection && navigator.connection.saveData);
    if (lead && !calm) start(lead, true);
  }

  /* ---------- events: upcoming / tonight / past from the clock ---------- */
  function eventsPage() {
    var up = doc.getElementById("events-up"), past = doc.getElementById("events-past");
    var cards = Array.prototype.slice.call(doc.querySelectorAll(".ecard[data-start]"));
    if (!cards.length) return;
    function sort() {
      var now = Date.now();
      cards.forEach(function (c) {
        var start = Date.parse(c.getAttribute("data-start")), allDay = c.hasAttribute("data-allday");
        var end = c.getAttribute("data-end") ? Date.parse(c.getAttribute("data-end")) + 86400000 : start + (allDay ? 86400000 : 12 * 3600000);
        var state = now >= end ? "past" : (now >= start - 18 * 3600000 && !allDay && now < end) ? "tonight" : "upcoming";
        var chip = c.querySelector("[data-state]");
        if (chip) { chip.textContent = s(state); chip.className = "tag " + (state === "past" ? "tag--muted" : "tag--red"); }
        var host = state === "past" ? past : up;
        if (host && c.parentNode !== host) host.appendChild(c);
      });
      [up, past].forEach(function (host, i) {
        if (!host) return;
        var kids = Array.prototype.slice.call(host.querySelectorAll(".ecard"));
        kids.sort(function (a, b) { var d = Date.parse(a.getAttribute("data-start")) - Date.parse(b.getAttribute("data-start")); return i === 0 ? d : -d; });
        kids.forEach(function (k) { host.appendChild(k); });
        var empty = host.parentNode.querySelector(".elist__empty");
        if (empty) empty.hidden = kids.length > 0;
      });
    }
    sort(); langHooks.push(sort); every(sort, 60000);
  }
  function eventPage() {
    var ev = PAGE.event; if (!ev) return;
    var el = doc.getElementById("event-count"), state = doc.getElementById("event-state"), tickets = doc.getElementById("event-tickets");
    function tick() {
      var now = Date.now(), start = Date.parse(ev.start), end = ev.allDay ? start + 86400000 : start + 12 * 3600000;
      if (ev.endDate) end = Date.parse(ev.endDate + "T00:00:00+07:00") + 86400000;
      if (el) {
        if (now < start && !ev.allDay) { el.hidden = false; el.innerHTML = '<span class="meta next__label">' + esc(s("doorsIn")) + '</span><p class="next__count" aria-hidden="true">' + countHTML(start - now) + '</p><p class="sr">' + esc(s("doorsIn") + " " + countText(start - now)) + "</p>"; }
        else el.hidden = true;
      }
      if (state) state.textContent = now >= end ? s("over") : now >= start ? s(ev.allDay ? "onToday" : "doorsOpen") : "";
      if (tickets && now >= end) tickets.hidden = true;
    }
    tick(); langHooks.push(tick); every(tick);
  }

  /* ---------- internships / jobs: the switch lives in data/intake.json ---------- */
  function intake() {
    var box = doc.getElementById("intake"); if (!box) return;
    var open = false;
    function paint() {
      box.classList.toggle("is-open", open);
      var st = doc.getElementById("intake-state"), d = doc.getElementById("intake-d"), apply = doc.getElementById("intake-apply"), how = doc.getElementById("intake-how");
      if (st) st.textContent = open ? s("intakeOpen") : s("intakeClosed");
      if (d) d.textContent = open ? s("intakeOpenD") : s("intakeClosedD");
      if (apply) apply.hidden = !open;
      if (how) how.hidden = !open;
    }
    paint(); langHooks.push(paint);
    if (!window.fetch) return;
    fetch(BASE + "data/intake.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { open = !!j && j.status === "open"; if (j && j.apply) { var a = doc.getElementById("intake-apply"); if (a) a.href = j.apply; } paint(); })
      .catch(function () { open = false; paint(); });
  }

  /* ---------- booking enquiry: built here, sent through Certified's own LINE / Instagram ---------- */
  function booking() {
    var form = doc.getElementById("bform"); if (!form) return;
    var LINE_ID = "@316ghxsa";
    var errsum = doc.getElementById("errsum"), ready = doc.getElementById("ready"), msgBox = doc.getElementById("ready-msg"), status = doc.getElementById("ready-status");
    var intlBits = Array.prototype.slice.call(form.querySelectorAll(".intl-only"));
    var country = form.elements["country"];
    function mode() { var m = form.querySelector('input[name="type"]:checked'); return m ? m.value : "venue"; }
    function syncMode() {
      var intl = mode() === "international";
      intlBits.forEach(function (el) { el.hidden = !intl; });
      if (country && !intl && !country.value) country.value = "Thailand";
      if (country && intl && country.value === "Thailand") country.value = "";
    }
    form.querySelectorAll('input[name="type"]').forEach(function (r) { r.addEventListener("change", syncMode); });
    /* context from the link, checked against known values (never personal data) */
    var known = ["mawon", "ossy", "tew", "wichaya", "maxlerr", "unit", "help"];
    if (params.get("type") === "international") { var ri = form.querySelector('input[name="type"][value="international"]'); if (ri) ri.checked = true; }
    (params.get("artist") || "").split(",").forEach(function (a) {
      a = a.trim().toLowerCase();
      if (known.indexOf(a) < 0) return;
      var cb = form.querySelector('input[name="artists"][value="' + a + '"]'); if (cb) cb.checked = true;
    });
    syncMode();
    var tbc = form.elements["date_tbc"], date = form.elements["date"];
    function syncDate() { if (date) { date.disabled = !!(tbc && tbc.checked); if (date.disabled) clearErr(date); } }
    if (tbc) tbc.addEventListener("change", syncDate); syncDate();

    function fieldOf(el) { return el.closest ? el.closest(".field") : null; }
    function setErr(el, msg) {
      var f = fieldOf(el); if (!f) return;
      f.classList.add("is-bad");
      var e = f.querySelector(".field__err"); if (e) e.textContent = msg;
      var ctl = el.length && !el.tagName ? el[0] : el;
      if (ctl && ctl.setAttribute) ctl.setAttribute("aria-invalid", "true");
    }
    function clearErr(el) {
      var f = fieldOf(el); if (!f) return;
      f.classList.remove("is-bad");
      var e = f.querySelector(".field__err"); if (e) e.textContent = "";
      f.querySelectorAll("[aria-invalid]").forEach(function (x) { x.removeAttribute("aria-invalid"); });
    }
    form.addEventListener("input", function (e) { if (e.target.name) clearErr(e.target); });
    form.addEventListener("change", function (e) { if (e.target.name) clearErr(e.target); });

    function val(n) { var el = form.elements[n]; return el && !el.disabled ? String(el.value || "").trim() : ""; }
    function validate() {
      var bad = [];
      function need(n, label) { var el = form.elements[n]; if (el && !el.disabled && !String(el.value || "").trim()) { setErr(el, s("required")); bad.push({ el: el, label: label }); } }
      need("name", t("bk.name", "Your name"));
      var em = form.elements["email"];
      if (em) { var v = em.value.trim(); if (!v) { setErr(em, s("required")); bad.push({ el: em, label: t("bk.email", "Email") }); } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErr(em, s("email")); bad.push({ el: em, label: t("bk.email", "Email") }); } }
      need("org", t("bk.org", "Organisation or venue"));
      var picks = form.querySelectorAll('input[name="artists"]:checked');
      if (!picks.length) { var first = form.querySelector('input[name="artists"]'); setErr(first, s("pickOne")); bad.push({ el: first, label: t("bk.who", "Who would you like to book?") }); }
      need("format", t("bk.format", "Event type"));
      if (!(tbc && tbc.checked)) {
        if (!date.value) { setErr(date, s("dateNeeded")); bad.push({ el: date, label: t("bk.date", "Event date") }); }
        else if (date.value < new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)) { setErr(date, s("pastDate")); bad.push({ el: date, label: t("bk.date", "Event date") }); }
      }
      need("city", t("bk.city", "City")); need("country", t("bk.country", "Country"));
      need("details", t("bk.details", "Tell us about the event"));
      return bad;
    }
    function label(el) { var f = fieldOf(el); var l = f && f.querySelector("label, .field__label"); return l ? l.textContent.replace(/\*|optional|ไม่บังคับ/gi, "").trim() : el.name; }
    /* "2026-11-27" -> "Fri 27 Nov 2026"; the message itself is always written in English for the booking team */
    function longDate(iso) {
      var ms = Date.parse(iso + "T00:00:00Z");
      if (isNaN(ms)) return iso;
      try { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(ms).replace(",", ""); } catch (e) { return iso; }
    }
    function compose() {
      var intl = mode() === "international";
      var who = Array.prototype.map.call(form.querySelectorAll('input[name="artists"]:checked'), function (c) { return c.getAttribute("data-label"); }).join(", ");
      var L = [];
      L.push(intl ? "INTERNATIONAL BOOKING ENQUIRY — Certified V10" : "BOOKING ENQUIRY — Certified V10");
      L.push("");
      L.push("Artist(s): " + who);
      L.push("Event type: " + val("format"));
      L.push("Date: " + (tbc && tbc.checked ? "Not confirmed yet" : longDate(val("date"))) + (val("time") ? " · start " + val("time") + " (local time)" : ""));
      if (intl && val("tz")) L.push("Event time zone: " + val("tz"));
      if (val("setlen")) L.push("Set length: " + val("setlen"));
      L.push((val("venue") ? "Venue: " + val("venue") + " · " : "Location: ") + val("city") + ", " + val("country"));
      if (val("audience")) L.push("Expected audience: " + val("audience"));
      if (val("budget")) L.push("Budget: " + val("budget") + " " + (val("currency") || ""));
      if (intl) {
        L.push("Flights: " + (val("travel") || "To discuss") + " · Accommodation: " + (val("hotel") || "To discuss") + " · Local transport: " + (val("ground") || "To discuss"));
      }
      L.push("");
      L.push("About the event:");
      L.push(val("details"));
      L.push("");
      L.push("From: " + val("name") + " — " + val("org"));
      L.push("Email: " + val("email") + (val("phone") ? " · Phone: " + val("phone") : ""));
      if (val("web")) L.push("Website / social: " + val("web"));
      if (val("contact")) L.push("Preferred contact: " + val("contact"));
      L.push("");
      L.push("(Sent from the Certified V10 website)");
      return L.join("\n");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.querySelectorAll(".field.is-bad").forEach(function (f) { f.classList.remove("is-bad"); });
      var bad = validate();
      if (bad.length) {
        ready.hidden = true;
        errsum.hidden = false;
        errsum.querySelector("p").textContent = s("errTitle").replace("{n}", bad.length);
        var ul = errsum.querySelector("ul"); ul.innerHTML = "";
        bad.forEach(function (b) {
          var li = doc.createElement("li"), a = doc.createElement("a");
          var target = b.el.id || (b.el.closest && b.el.closest(".field") && b.el.closest(".field").id);
          a.href = "#" + (b.el.id || ""); a.textContent = label(b.el);
          a.addEventListener("click", function (ev) { ev.preventDefault(); try { b.el.focus(); } catch (x) {} });
          li.appendChild(a); ul.appendChild(li);
        });
        errsum.focus();
        return;
      }
      errsum.hidden = true;
      msgBox.textContent = compose();
      status.textContent = "";
      ready.hidden = false;
      ready.focus();
    });
    function copy(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
      return Promise.resolve(fallback());
      function fallback() {
        try { var r = doc.createRange(); r.selectNodeContents(msgBox); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); var ok = doc.execCommand("copy"); sel.removeAllRanges(); return ok; } catch (x) { return false; }
      }
    }
    doc.getElementById("send-line").addEventListener("click", function (e) {
      var text = msgBox.textContent;
      this.href = "https://line.me/R/oaMessage/" + encodeURIComponent(LINE_ID) + "/?" + encodeURIComponent(text);
      status.textContent = s("lineOpened");
      copy(text);
    });
    doc.getElementById("send-ig").addEventListener("click", function () {
      var text = msgBox.textContent;
      copy(text).then(function (ok) { status.textContent = ok ? s("copied") : s("copyFail"); });
    });
    doc.getElementById("copy-msg").addEventListener("click", function () {
      copy(msgBox.textContent).then(function (ok) { status.textContent = ok ? s("copiedOnly") : s("copyFail"); });
    });
  }

  /* ---------- merch product: the size feeds the "Notify me" message; ordering stays off until a shop is connected ---------- */
  function merchProduct() {
    var form = doc.getElementById("pform"); if (!form) return;
    var notify = doc.getElementById("notify"), qty = form.elements["qty"], name = form.getAttribute("data-name");
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    function clamp() { qty.value = Math.min(5, Math.max(1, parseInt(qty.value, 10) || 1)); }
    form.querySelectorAll(".qty__btn").forEach(function (b) {
      b.addEventListener("click", function () { qty.value = (parseInt(qty.value, 10) || 1) + +b.getAttribute("data-step"); clamp(); });
    });
    qty.addEventListener("change", clamp);
    function sync() {
      var sz = form.querySelector('input[name="size"]:checked');
      var text = "Hi Certified — please let me know when the " + name + (sz ? " (size " + sz.value + ")" : "") + " is available. (Sent from the Certified V10 website)";
      if (notify) notify.href = "https://line.me/R/oaMessage/%40316ghxsa/?" + encodeURIComponent(text);
    }
    form.addEventListener("change", sync); sync();
  }

  /* ---------- shared timer: one interval, paused while the tab is hidden ---------- */
  var tasks = [];
  function every(fn, ms) { tasks.push({ fn: fn, ms: ms || 1000, last: 0 }); }
  setInterval(function () {
    if (doc.hidden) return;
    var now = Date.now();
    tasks.forEach(function (tk) { if (now - tk.last >= tk.ms - 20) { tk.last = now; try { tk.fn(); } catch (e) {} } });
  }, 1000);
  doc.addEventListener("visibilitychange", function () { if (!doc.hidden) tasks.forEach(function (tk) { tk.last = 0; }); });

  /* ---------- nav: hides on the way down, returns on the way up ---------- */
  var nav = doc.getElementById("nav"), lastY = 0, hudHead = doc.getElementById("hud-head");
  function onScroll() {
    var y = window.scrollY || root.scrollTop;
    if (nav) {
      if (y < 80) nav.classList.remove("is-hidden");
      else if (y > lastY + 6) nav.classList.add("is-hidden");
      else if (y < lastY - 6) nav.classList.remove("is-hidden");
    }
    lastY = y;
    if (hudHead) { var docH = Math.max(1, root.scrollHeight - innerHeight); hudHead.style.width = Math.min(100, y / docH * 100) + "%"; }
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var clockEl = doc.getElementById("clock");
  function tickClock() { if (clockEl) clockEl.textContent = "BKK " + hhmm(Date.now()); }
  tickClock(); every(tickClock, 30000);

  /* ---------- menu: modal on small screens; focus stays inside, Escape closes, focus returns ---------- */
  var sheet = doc.getElementById("sheet"), burger = doc.getElementById("burger"), sheetTimer = null;
  var outside = [doc.getElementById("main"), doc.querySelector(".footer"), doc.getElementById("hud"), doc.querySelector(".skip")];
  function setInert(on) { outside.forEach(function (el) { if (!el) return; if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); }); }
  function openSheet() {
    if (!sheet) return;
    clearTimeout(sheetTimer);
    sheet.hidden = false; void sheet.offsetHeight;
    body.classList.add("sheet-open"); burger.setAttribute("aria-expanded", "true"); setInert(true);
    var first = sheet.querySelector("a"); if (first) first.focus({ preventScroll: true });
  }
  function closeSheet(restore) {
    if (!sheet || !body.classList.contains("sheet-open")) return;
    body.classList.remove("sheet-open"); burger.setAttribute("aria-expanded", "false"); setInert(false);
    sheetTimer = setTimeout(function () { sheet.hidden = true; }, 520);
    if (restore) burger.focus();
  }
  if (burger) burger.addEventListener("click", function () { body.classList.contains("sheet-open") ? closeSheet(false) : openSheet(); });
  if (sheet) sheet.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { closeSheet(false); }); });
  doc.addEventListener("keydown", function (e) {
    if (!body.classList.contains("sheet-open")) return;
    if (e.key === "Escape") { e.preventDefault(); closeSheet(true); return; }
    if (e.key !== "Tab") return;
    var ring = [].concat(Array.prototype.slice.call(nav.querySelectorAll("a, button")).filter(function (el) { return el.offsetParent !== null; }), Array.prototype.slice.call(sheet.querySelectorAll("a")));
    var i = ring.indexOf(doc.activeElement);
    if (i < 0) return;
    if (e.shiftKey && i === 0) { e.preventDefault(); ring[ring.length - 1].focus(); }
    else if (!e.shiftKey && i === ring.length - 1) { e.preventDefault(); ring[0].focus(); }
  });
  window.addEventListener("resize", function () { if (innerWidth > 900) closeSheet(false); });

  /* ---------- reveals ---------- */
  var revEls = doc.querySelectorAll("[data-rev], h1, h2");
  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revEls.forEach(function (el) { io.observe(el); });
  } else revEls.forEach(function (el) { el.classList.add("is-in"); });

  /* ---------- boot ---------- */
  artistPage(); players(); eventsPage(); eventPage(); intake(); booking(); merchProduct();
  var saved = null; try { saved = localStorage.getItem("cv-lang"); } catch (e) {}
  var want = params.get("lang") === "th" || params.get("lang") === "en" ? params.get("lang") : saved === "th" ? "th" : "en";
  setLang(want, false);
  if (want === "th" && params.get("lang") !== "th") langURL();
})();
