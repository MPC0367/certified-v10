/* ============================================================
   CERTIFIED_V10 — instruments
   vanilla JS: IO reveals, sticky dyno scrub, HUD, i18n, QA harness
   ============================================================ */
(function () {
  "use strict";

  var doc = document, root = doc.documentElement, body = doc.body;
  var params = new URLSearchParams(location.search);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SHOT = params.has("shot");
  var QA = params.get("qa");

  /* ---------- phase model ---------- */
  var PHASES = [
    { bpm: 118, time: "22:30" },
    { bpm: 128, time: "00:00" },
    { bpm: 150, time: "01:30" },
    { bpm: 100, time: "03:30" }
  ];
  var BPM_MIN = 90, BPM_MAX = 160, BPM_START = 95;

  /* ---------- i18n ---------- */
  var DICT = window.CV_TH || {};
  var LANG = "en";
  var HUD_EN = {
    "hud.open": "COLD OPEN", "hud.spec": "SPEC SHEET", "hud.dyno": "BENCH TEST",
    "hud.lineup": "THE LINEUP", "hud.rooms": "CERTIFIED ROOMS", "hud.record": "SERVICE RECORD",
    "hud.shows": "NEXT SHIFT", "hud.book": "COMMISSION"
  };
  function t(key, fallback) {
    if (LANG === "th" && DICT[key]) return DICT[key];
    return fallback !== undefined ? fallback : (HUD_EN[key] || key);
  }
  function setLang(lang, persist) {
    LANG = lang;
    body.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "th" ? "th" : "en");
    doc.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (el.__en === undefined) el.__en = el.textContent;
      el.textContent = (lang === "th" && DICT[key]) ? DICT[key] : el.__en;
    });
    doc.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (el.__enAlt === undefined) el.__enAlt = el.getAttribute("alt") || "";
      el.setAttribute("alt", (lang === "th" && DICT[key]) ? DICT[key] : el.__enAlt);
    });
    if (persist) { try { localStorage.setItem("cv-lang", lang); } catch (e) {} }
    if (hudLabelKey) hudLabel.textContent = t(hudLabelKey);
    syncPhaseText();
    tickCountdown();
  }

  /* ---------- clock (BKK) ---------- */
  var clockEl = doc.getElementById("clock");
  function tickClock() {
    try {
      var s = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" }).format(new Date());
      clockEl.textContent = "BKK " + s;
    } catch (e) { clockEl.textContent = ""; }
  }
  tickClock(); setInterval(tickClock, 30000);

  /* ---------- nav ---------- */
  var nav = doc.getElementById("nav");
  var lastY = 0, navPinned = true;
  function onNavScroll(y) {
    nav.classList.toggle("is-solid", y > 24);
    if (SHOT) return;
    if (y < 80) { nav.classList.remove("is-hidden"); }
    else if (y > lastY + 6) { nav.classList.add("is-hidden"); }
    else if (y < lastY - 6) { nav.classList.remove("is-hidden"); }
    lastY = y;
  }

  /* ---------- mobile sheet ---------- */
  var sheet = doc.getElementById("sheet");
  var burger = doc.getElementById("burger");
  var sheetTimer = null;
  function openSheet() {
    clearTimeout(sheetTimer);
    sheet.hidden = false;
    void sheet.offsetHeight; /* commit display before the transition class */
    body.classList.add("sheet-open");
    burger.setAttribute("aria-expanded", "true");
  }
  function closeSheet() {
    body.classList.remove("sheet-open");
    burger.setAttribute("aria-expanded", "false");
    sheetTimer = setTimeout(function () { sheet.hidden = true; }, 520);
  }
  burger.addEventListener("click", function () {
    body.classList.contains("sheet-open") ? closeSheet() : openSheet();
  });
  sheet.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeSheet); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && body.classList.contains("sheet-open")) closeSheet(); });

  /* ---------- lang toggle ---------- */
  doc.getElementById("lang-toggle").addEventListener("click", function () {
    setLang(LANG === "en" ? "th" : "en", true);
  });

  /* ---------- reveals ---------- */
  var revEls = doc.querySelectorAll("[data-rev], h1, h2");
  if (!SHOT && !reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revEls.forEach(function (el) { io.observe(el); });
  } else {
    revEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- tach build ---------- */
  var CX = 150, CY = 150, R = 118;
  function pt(bpm, r) {
    var a = (-120 + (bpm - BPM_MIN) / (BPM_MAX - BPM_MIN) * 240) * Math.PI / 180;
    return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  }
  function arcPath(b1, b2, r) {
    var p1 = pt(b1, r), p2 = pt(b2, r);
    var large = (b2 - b1) / (BPM_MAX - BPM_MIN) * 240 > 180 ? 1 : 0;
    return "M" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + " A" + r + " " + r + " 0 " + large + " 1 " + p2[0].toFixed(2) + " " + p2[1].toFixed(2);
  }
  (function buildTach() {
    var track = doc.getElementById("tach-track");
    var red = doc.getElementById("tach-red");
    if (!track) return;
    track.setAttribute("d", arcPath(BPM_MIN, BPM_MAX, R));
    red.setAttribute("d", arcPath(140, BPM_MAX, R));
    var ticks = doc.getElementById("tach-ticks");
    var nums = doc.getElementById("tach-nums");
    var svgNS = "http://www.w3.org/2000/svg";
    for (var b = BPM_MIN; b <= BPM_MAX; b += 5) {
      var major = b % 10 === 0;
      var o = pt(b, R - 8), i = pt(b, R - 8 - (major ? 13 : 7));
      var ln = doc.createElementNS(svgNS, "line");
      ln.setAttribute("x1", o[0]); ln.setAttribute("y1", o[1]);
      ln.setAttribute("x2", i[0]); ln.setAttribute("y2", i[1]);
      ln.setAttribute("class", "tach__tick" + (b >= 140 ? " tach__tick--red" : ""));
      ticks.appendChild(ln);
      if (major) {
        var p = pt(b, R - 36);
        var tx = doc.createElementNS(svgNS, "text");
        tx.setAttribute("x", p[0]); tx.setAttribute("y", p[1] + 3);
        tx.textContent = b;
        nums.appendChild(tx);
      }
    }
  })();

  /* ---------- dyno state ---------- */
  var pin = doc.getElementById("dyno-pin");
  var needle = doc.getElementById("needle");
  var bpmRead = doc.getElementById("bpm-read");
  var dynoClock = doc.getElementById("dyno-clock");
  var dynoFig = doc.getElementById("dyno-fig");
  var phaseNo = doc.getElementById("phase-no");
  var phaseName = doc.getElementById("phase-name");
  var phaseRows = doc.querySelectorAll("#phase-list li");
  var phTexts = doc.querySelectorAll(".dyno__text");
  var phImgs = doc.querySelectorAll(".dyno__ph");
  var flash = doc.getElementById("flash");
  var curPhase = -1, lastFlash = 0;

  function setNeedle(bpm) {
    var a = -120 + (Math.max(BPM_MIN, Math.min(BPM_MAX, bpm)) - BPM_MIN) / (BPM_MAX - BPM_MIN) * 240;
    needle.style.transform = "rotate(" + a.toFixed(2) + "deg)";
  }
  function fmtTime(mins) {
    mins = Math.round(mins) % 1440;
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function syncPhaseText() {
    if (curPhase < 0) return;
    var i = curPhase;
    phaseNo.textContent = t("dyno.phaseWord", "Phase") + " 0" + (i + 1);
    var nameEl = phaseRows[i] && phaseRows[i].querySelector("span");
    phaseName.textContent = nameEl ? nameEl.textContent : "";
    dynoFig.textContent = "FIG. 0" + (i + 1) + " — " + PHASES[i].time;
  }
  function setPhase(i, doFlash) {
    if (i === curPhase) return;
    curPhase = i;
    phImgs.forEach(function (im) { im.classList.toggle("is-on", +im.getAttribute("data-p") === i); });
    phTexts.forEach(function (tx) { tx.classList.toggle("is-on", +tx.getAttribute("data-p") === i); });
    phaseRows.forEach(function (r) { r.classList.toggle("is-on", +r.getAttribute("data-p") === i); });
    syncPhaseText();
    var now = performance.now();
    if (doFlash && !SHOT && !reduced && now - lastFlash > 420) {
      lastFlash = now;
      flash.classList.add("is-on");
      requestAnimationFrame(function () { requestAnimationFrame(function () { flash.classList.remove("is-on"); }); });
    }
  }
  function dynoAt(p) {
    var seg = Math.min(3, Math.floor(p * 4));
    var local = p * 4 - seg;
    var from = seg === 0 ? BPM_START : PHASES[seg - 1].bpm;
    var to = PHASES[seg].bpm;
    var k = Math.min(1, local / 0.38);
    k = 1 - Math.pow(1 - k, 3); /* easeOutCubic */
    var bpm = from + (to - from) * k;
    setPhase(seg, true);
    setNeedle(bpm);
    var shown = Math.round(bpm);
    if (bpmRead.__v !== shown) { bpmRead.__v = shown; bpmRead.textContent = shown; }
    dynoClock.textContent = fmtTime(1350 + p * 330);
    return bpm;
  }

  /* ---------- countdown (Next shift: Wingstop Vol.2) ---------- */
  var CD_T0 = Date.parse("2026-08-28T17:00:00Z"); /* Fri 29 Aug 2026 00:00 ICT */
  var CD_T1 = Date.parse("2026-08-30T21:00:00Z"); /* Mon 31 Aug 2026 04:00 ICT — end of night 02 */
  var CD_EN = {
    "shows.pre": "T-minus to night 01 — Fri 29 Aug",
    "shows.live": "In session — tonight at Samyan Mitrtown",
    "shows.done": "Shift complete — next date via IG"
  };
  var cdD = doc.getElementById("cd-d"), cdH = doc.getElementById("cd-h"),
      cdM = doc.getElementById("cd-m"), cdS = doc.getElementById("cd-s"),
      cdStatus = doc.getElementById("cd-status"),
      cdBox = doc.querySelector(".count");
  var hcdD = doc.getElementById("hcd-d"), hcdH = doc.getElementById("hcd-h"),
      hcdM = doc.getElementById("hcd-m"), hcdS = doc.getElementById("hcd-s");
  var heroNext = doc.querySelector(".hero__next");
  var heroTime = doc.querySelector(".hero__next-time");
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function tickCountdown() {
    if (!cdD) return;
    var now = Date.now(), key;
    if (now < CD_T0) {
      key = "shows.pre";
      var s = Math.floor((CD_T0 - now) / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      cdD.textContent = pad2(d); cdH.textContent = pad2(h);
      cdM.textContent = pad2(m); cdS.textContent = pad2(s);
      if (hcdD) {
        hcdD.textContent = pad2(d); hcdH.textContent = pad2(h);
        hcdM.textContent = pad2(m); hcdS.textContent = pad2(s);
      }
    } else {
      key = now < CD_T1 ? "shows.live" : "shows.done";
      cdD.textContent = "00"; cdH.textContent = "00"; cdM.textContent = "00"; cdS.textContent = "00";
      cdBox.classList.add("is-live");
      if (heroNext) {
        if (key === "shows.done") { heroNext.style.display = "none"; }
        else if (heroTime) { heroTime.textContent = t("hero.live", "In session now"); }
      }
    }
    cdStatus.textContent = (LANG === "th" && DICT[key]) ? DICT[key] : CD_EN[key];
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- lineup peek (desktop hover) ---------- */
  var peekImgs = doc.querySelectorAll(".peek__ph");
  var peekFig = doc.getElementById("peek-fig");
  doc.querySelectorAll(".op").forEach(function (row) {
    row.addEventListener("mouseenter", function () {
      var p = +row.getAttribute("data-p");
      peekImgs.forEach(function (im) { im.classList.toggle("is-on", +im.getAttribute("data-p") === p); });
      var nameImg = row.querySelector(".op__name img");
      if (peekFig) peekFig.textContent = "FILE 0" + (p + 1) + " — " + (nameImg ? nameImg.alt : "");
    });
  });

  /* ---------- lineup spotlight (mobile scroll) ----------
     the row whose header sits nearest mid-viewport expands its drop,
     as if hovered. Drops share one height, so a spotlight handoff is
     collapse-above + expand-below and the scroll position stays stable. */
  var mqSpot = window.matchMedia("(max-width: 900px)");
  var ops = Array.prototype.slice.call(doc.querySelectorAll(".op"));
  var spotCur = -1;
  var SPOT_HOLD = 800; /* ms a spotlight is held before a driver may hand off */
  var lastSwitch = 0;
  function setSpot(i, force) {
    if (i === spotCur) return;
    /* handoffs between rows respect the hold; first pick and clears are instant */
    if (!force && i !== -1 && spotCur !== -1 && performance.now() - lastSwitch < SPOT_HOLD) return;
    spotCur = i;
    lastSwitch = performance.now();
    ops.forEach(function (r, k) { r.classList.toggle("is-spot", k === i); });
  }
  window.__cvSpot = function (i) { setSpot(i, true); };
  var lastGeom = 0;
  function spotFrame() {
    if (!ops.length) return;
    if (!mqSpot.matches) { if (spotCur !== -1) setSpot(-1); return; }
    if (vh > 2200) return; /* grow-to-content iframe (host scrolls the parent): the IO driver owns the spotlight */
    lastGeom = performance.now();
    var mid = vh / 2, best = -1, bestD = 1e9;
    for (var k = 0; k < ops.length; k++) {
      var hd = ops[k].querySelector(".op__head").getBoundingClientRect();
      var c = hd.top + hd.height / 2;
      if (c < -vh * 0.2 || c > vh * 1.2) continue;
      var d = Math.abs(c - mid);
      if (d < bestD) { bestD = d; best = k; }
    }
    if (best < 0) { setSpot(-1); return; }
    var bh = ops[best].querySelector(".op__head").getBoundingClientRect();
    var bc = bh.top + bh.height / 2;
    if (bc < vh * 0.1 || bc > vh * 0.9) { setSpot(-1); return; }
    if (best !== spotCur && spotCur >= 0) {
      var ch = ops[spotCur].querySelector(".op__head").getBoundingClientRect();
      var cd = Math.abs(ch.top + ch.height / 2 - mid);
      if (bestD > cd - 120) return; /* wide dead zone: stick with the current one */
    }
    setSpot(best);
  }
  /* belt and braces: some mobile webviews throttle rAF inside iframes —
     drive the spotlight from scroll events too */
  if (!SHOT) {
    window.addEventListener("scroll", function () { vh = window.innerHeight; spotFrame(); }, { passive: true });
    window.addEventListener("touchmove", spotFrame, { passive: true });
    setTimeout(spotFrame, 400);
  }
  /* last-resort driver: an IntersectionObserver band works even when the page
     is embedded in a grow-to-content iframe whose PARENT does the scrolling
     (geometry + scroll events are blind there). It only takes over when the
     geometric driver is inert or stale. */
  if (!SHOT && "IntersectionObserver" in window) {
    var spotIO = new IntersectionObserver(function (entries) {
      if (!mqSpot.matches) return;
      if (vh <= 2200 && performance.now() - lastGeom < 800) return; /* geometric driver is alive — defer */
      var cand = -1;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var row = en.target.closest(".op");
          if (row) cand = ops.indexOf(row);
        }
      });
      if (cand >= 0) setSpot(cand);
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
    ops.forEach(function (r) {
      var hd = r.querySelector(".op__head");
      if (hd) spotIO.observe(hd);
    });
  }

  /* ---------- HUD ---------- */
  var hud = doc.getElementById("hud");
  var hudLabel = doc.getElementById("hud-label");
  var hudBpm = doc.getElementById("hud-bpm");
  var hudHead = doc.getElementById("hud-head");
  var hudTrack = doc.getElementById("hud-track");
  var hudLabelKey = "hud.open";
  var sections = Array.prototype.slice.call(doc.querySelectorAll("[data-hud]"));
  var bpmTarget = 128, bpmShown = 128;

  function buildTicks() {
    Array.prototype.slice.call(hudTrack.querySelectorAll(".hud__tick")).forEach(function (n) { n.remove(); });
    var docH = Math.max(1, root.scrollHeight - window.innerHeight);
    sections.forEach(function (s, i) {
      if (i === 0) return;
      var sp = doc.createElement("span");
      sp.className = "hud__tick";
      sp.style.left = Math.min(99.5, s.offsetTop / docH * 100) + "%";
      hudTrack.appendChild(sp);
    });
  }

  var secIO = null;
  if ("IntersectionObserver" in window) {
    secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var key = en.target.getAttribute("data-hud");
        hudLabelKey = key;
        hudLabel.textContent = t(key);
        var b = +en.target.getAttribute("data-bpm");
        if (b > 0) bpmTarget = b;
        var id = en.target.id;
        doc.querySelectorAll(".nav__links a").forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
    sections.forEach(function (s) { secIO.observe(s); });
  }

  /* ---------- main loop ---------- */
  var vh = window.innerHeight;
  window.addEventListener("resize", function () { vh = window.innerHeight; buildTicks(); });

  function frame() {
    if (!doc.hidden) {
      var y = window.scrollY || root.scrollTop;
      onNavScroll(y);
      var docH = Math.max(1, root.scrollHeight - vh);
      hudHead.style.width = Math.min(100, y / docH * 100) + "%";

      if (pin && !reduced && !SHOT) {
        var r = pin.getBoundingClientRect();
        var total = r.height - vh;
        if (total > 40 && r.top <= 0 && r.bottom >= vh) {
          bpmTarget = dynoAt(Math.max(0, Math.min(1, -r.top / total)));
          bpmShown = bpmTarget;
        } else if (r.top > 0 && curPhase !== 0 && r.top < vh) {
          dynoAt(0);
        }
      }
      bpmShown += (bpmTarget - bpmShown) * 0.08;
      var sb = Math.round(bpmShown);
      if (hudBpm.__v !== sb) { hudBpm.__v = sb; hudBpm.textContent = sb; }
      if (!SHOT) spotFrame(); /* runs under reduced-motion too — the expand is instant there, but the content stays reachable */
    }
    requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  if (!body.getAttribute("data-lang")) body.setAttribute("data-lang", "en"); /* artifact wrapper has a bare <body> */
  var savedLang = null;
  try { savedLang = localStorage.getItem("cv-lang"); } catch (e) {}
  if (params.get("lang") === "th") setLang("th", false);
  else if (params.get("lang") === "en") setLang("en", false);
  else if (savedLang === "th") setLang("th", true);

  if (reduced || SHOT) {
    dynoAt(SHOT && params.has("p") ? Math.min(.999, Math.max(0, (+params.get("p") * 0.25) + 0.12)) : 0.62);
  } else {
    dynoAt(0);
  }
  buildTicks();
  requestAnimationFrame(frame);

  /* ============================================================
     QA / SHOT HARNESS
     ?shot=<id|full>&p=0..3&off=px&probe=sel,sel&lang=th
     static mode: no anims; position via body margin shift (never scrollTo)
     ============================================================ */
  if (SHOT) {
    body.classList.add("shot");
    doc.querySelectorAll("img[loading=lazy]").forEach(function (im) { im.setAttribute("loading", "eager"); });
    var target = params.get("shot");
    var off = +(params.get("off") || 0);

    if (params.has("p")) {
      var pi = Math.max(0, Math.min(3, +params.get("p")));
      dynoAt(pi * 0.25 + 0.12);
    }
    if (params.has("spot")) setSpot(Math.max(0, Math.min(4, +params.get("spot"))), true);

    var pinFull = function () {
      /* finite page: freeze vh-based zones to a nominal 900px viewport so one tall capture rasters everything */
      body.classList.add("shot-full");
      var hero = doc.querySelector(".hero");
      hero.style.minHeight = "900px";
      pin.style.height = "auto";
      var stage = pin.querySelector(".dyno__stage");
      stage.style.position = "static";
      stage.style.height = "auto";
      stage.style.paddingTop = "40px";
      stage.style.paddingBottom = "40px";
    };

    var applyShot = function () {
      var y = 0;
      body.style.marginTop = "0px"; /* reset so rect.top is the absolute page offset */
      if (target === "full") { pinFull(); }
      else if (target && target !== "1") {
        var el = doc.getElementById(target) || doc.querySelector(target);
        if (el) {
          if (target === "dyno") {
            /* land mid-pin so the sticky stage is in frame */
            var pinTop = pin.getBoundingClientRect().top;
            y = pinTop + (pin.offsetHeight - vh) * (params.has("p") ? (+params.get("p") / 3) * 0.94 + 0.03 : 0.5);
          } else {
            y = el.getBoundingClientRect().top - 64;
          }
          y += off;
          body.style.marginTop = -y + "px";
        }
      } else if (off) {
        y = off;
        body.style.marginTop = -y + "px";
      }
      nav.classList.toggle("is-solid", y > 24);
      /* fake the HUD playhead to the shifted position (scrollY stays 0 in shot mode) */
      var docH = Math.max(1, root.scrollHeight - vh);
      hudHead.style.width = Math.min(100, y / docH * 100) + "%";
      applyShot.pass = (applyShot.pass || 0) + 1;
      if (params.has("probe")) {
        var pre = doc.getElementById("probe-out");
        if (!pre) {
          pre = doc.createElement("pre");
          pre.id = "probe-out";
          pre.style.cssText = "position:fixed;left:8px;top:8px;z-index:999;background:#000;color:#0f0;font:12px monospace;padding:6px;max-width:60vw;white-space:pre-wrap;";
          body.appendChild(pre);
        }
        var rep = ["pass " + applyShot.pass, "y " + Math.round(y), "vh " + vh, "fonts " + (doc.fonts ? doc.fonts.status : "?")];
        params.get("probe").split(",").forEach(function (sel) {
          var el2 = doc.querySelector(sel);
          if (el2) { var r2 = el2.getBoundingClientRect(); rep.push(sel + " top " + Math.round(r2.top) + " h " + Math.round(r2.height)); }
        });
        pre.textContent = rep.join("\n");
      }
    };

    if (params.get("open") === "sheet") openSheet();

    /* run NOW, then keep re-applying while fonts/images settle — the capture
       can fire at any point near load, so converge continuously for 2.5s */
    applyShot();
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(applyShot);
    window.addEventListener("load", applyShot);
    /* headless Edge lays out at a shorter viewport during load, then resizes to the
       full window right before rasterizing — vh-based heights re-resolve, so the
       margin must be recomputed on every resize */
    window.addEventListener("resize", applyShot);
    var shotIv = setInterval(applyShot, 150);
    setTimeout(function () { clearInterval(shotIv); applyShot(); }, 8000);
  }

  /* QA convenience: window.__cvSet(p) scrubs the dyno for live testing */
  window.__cvSet = function (p) { return dynoAt(Math.max(0, Math.min(1, p))); };
  window.__cvLang = function (l) { setLang(l, false); };
})();
