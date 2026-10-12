/* CERTIFIED_V10 — page behaviour.
   Everything here is an enhancement: the HTML is complete and readable
   without it, and each block only changes the page once its setup succeeds. */
(function () {
  "use strict";

  var doc = document;
  var I = window.CVI18n;
  var S = window.CVSchedule;
  var UI = window.CVScheduleUI;
  var NAMES = { mawon: "MAWON", ossy: "OSSY", tew: "TEW", wichaya: "WICHAYA", maxlerr: "MAXLERR" };

  function guard(name, fn) {
    try { fn(); } catch (e) { if (window.console) console.error("[cv] " + name, e); }
  }

  guard("language", function () { I.init(); });

  /* ---------- mobile menu: a modal dialog ---------- */
  guard("menu", function () {
    var menu = doc.getElementById("menu");
    var openBtn = doc.getElementById("menu-open");
    var closeBtn = doc.getElementById("menu-close");
    if (!menu || !openBtn || !closeBtn) return;
    var background = [].slice.call(doc.querySelectorAll("[data-page]"));
    var wide = window.matchMedia("(min-width: 1024px)");

    function focusable() {
      return [].slice.call(menu.querySelectorAll("a[href], button:not([disabled])")).filter(function (el) {
        return !el.hidden && el.offsetParent !== null;
      });
    }

    function open() {
      if (!menu.hidden) return;
      menu.hidden = false;
      background.forEach(function (el) { el.inert = true; });
      doc.documentElement.classList.add("menu-open");
      openBtn.setAttribute("aria-expanded", "true");
      closeBtn.focus();
    }

    function close(returnFocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      background.forEach(function (el) { el.inert = false; });
      doc.documentElement.classList.remove("menu-open");
      openBtn.setAttribute("aria-expanded", "false");
      if (returnFocus) openBtn.focus();
    }

    openBtn.hidden = false;
    doc.documentElement.classList.add("has-menu");
    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", function () { close(true); });
    menu.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a[href]")) close(false);
    });
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); close(true); return; }
      if (e.key !== "Tab") return;
      var items = focusable();
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    function onWide(e) { if (e.matches) close(false); }
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else if (wide.addListener) wide.addListener(onWide);
  });

  /* ---------- artist details: explicit disclosure ---------- */
  guard("artist details", function () { UI.disclosures(doc); });

  /* ---------- sound sequence: four phases as tabs ---------- */
  guard("sound tabs", function () {
    var wrap = doc.getElementById("sound");
    if (!wrap) return;
    var list = wrap.querySelector(".sound__tabs");
    var tabs = [].slice.call(wrap.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) { return doc.getElementById(tab.getAttribute("aria-controls")); });
    if (!list || !tabs.length || panels.indexOf(null) >= 0) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
    }

    panels.forEach(function (panel, i) {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabs[i].id);
      panel.tabIndex = 0;
    });
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % tabs.length
          : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i + tabs.length - 1) % tabs.length
          : e.key === "Home" ? 0
          : e.key === "End" ? tabs.length - 1
          : -1;
        if (next < 0) return;
        e.preventDefault();
        select(next, true);
      });
    });
    list.hidden = false;
    wrap.classList.add("is-tabs");
    select(0, false);
  });

  /* ---------- enquiry draft: local text, copied only on request ---------- */
  guard("enquiry draft", function () {
    var box = doc.getElementById("draft-text");
    var btn = doc.getElementById("draft-copy");
    var status = doc.getElementById("draft-status");
    var tool = doc.getElementById("draft");
    if (!box || !btn || !status || !tool) return;
    var template = I.t("draft.template");
    box.value = template;
    tool.hidden = false;

    I.onChange(function () {
      var untouched = box.value === template;
      template = I.t("draft.template");
      if (untouched) box.value = template;
      status.textContent = "";
    });

    function fallback() {
      box.focus();
      box.select();
      status.textContent = I.t("draft.fail");
    }

    btn.addEventListener("click", function () {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return fallback();
      navigator.clipboard.writeText(box.value).then(function () {
        status.textContent = I.t("draft.ok");
      }, fallback);
    });
  });

  /* ---------- derived dates for past records ---------- */
  guard("record dates", function () {
    function paint() {
      [].slice.call(doc.querySelectorAll("time[data-dates]")).forEach(function (el) {
        var text = el.getAttribute("data-dates").split(",").map(function (d) {
          return S.formatDate(d, I.lang);
        }).filter(Boolean).join(" – ");
        if (text) el.textContent = text;
      });
    }
    paint();
    I.onChange(paint);
  });

  /* ---------- schedule: public feed through the adapter ---------- */
  guard("schedule", function () {
    if (!doc.querySelector(".artist[data-artist]")) return;
    var ui = UI.mount({ names: NAMES });
    var FEED = "data/schedule.json";
    var lastTry = 0;
    var refresh = null;

    function plan() {
      clearTimeout(refresh);
      if (!doc.hidden) refresh = setTimeout(load, S.BUDGET.refreshMs);
    }

    function load() {
      lastTry = Date.now();
      fetch(FEED, { cache: "no-store" })
        .then(function (res) {
          if (!res.ok) throw new Error("feed " + res.status);
          return res.json();
        })
        .then(function (envelope) {
          if (envelope.sourceMode !== "live") throw new Error("feed is not a live envelope");
          ui.setData(envelope, { lastSuccessMs: Date.now(), allowDemo: false });
        })
        .catch(function () { ui.setFailed(); })
        .then(plan);
    }

    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) { clearTimeout(refresh); return; }
      if (Date.now() - lastTry >= S.BUDGET.refreshMs) load();
      else plan();
    });
    window.addEventListener("pagehide", function () { clearTimeout(refresh); });
    load();
  });
})();
