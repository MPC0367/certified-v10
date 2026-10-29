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
    play: ["Play set", "เล่นเซ็ต"], playing: ["Playing — {t}", "กำลังเล่น — {t}"],
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
  function players() {
    var active = null;
    doc.querySelectorAll("[data-yt]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-yt"), media = btn.parentNode, title = btn.getAttribute("data-title") || "";
        if (active && active.media !== media) {
          active.frame.remove(); active.btn.hidden = false;
        }
        var f = doc.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&playsinline=1&rel=0";
        f.title = s("playing").replace("{t}", title);
        f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        f.allowFullscreen = true;
        f.referrerPolicy = "strict-origin-when-cross-origin";
        btn.hidden = true;
        media.appendChild(f);
        f.focus();
        active = { media: media, frame: f, btn: btn };
      });
    });
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
