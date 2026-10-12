/* CERTIFIED_V10 — renders schedule state into the page.
   One instance drives the hero line, the shows list and every artist row from
   the same normalized feed. All text goes in through textContent. */
(function () {
  "use strict";

  var S = window.CVSchedule;
  var I = window.CVI18n;

  function mount(opts) {
    var root = opts.root || document;
    var now = opts.now || Date.now;
    var names = opts.names || {};
    var rows = [].slice.call(root.querySelectorAll(".artist[data-artist]"));
    var showsEl = root.querySelector('[data-slot="shows"]');
    var heroEl = root.querySelector('[data-slot="hero-next"]');
    var staleEl = root.querySelector('[data-slot="stale"]');
    var liveEl = root.querySelector('[data-slot="announce"]');

    var state = { norm: null, failed: false, lastSuccessMs: null };
    var timer = null;
    var seen = {};
    var firstRender = true;

    function slot(row, name) { return row.querySelector('[data-slot="' + name + '"]'); }

    function put(el, value) {
      if (!el) return;
      var empty = value == null || value === "";
      el.hidden = empty;
      if (el.textContent !== (empty ? "" : value)) el.textContent = empty ? "" : value;
    }

    function when(ev, ms) { return S.formatDateTime(ms, ev.venueTimeZone, I.lang); }

    function place(ev) { return ev.city ? ev.venueName + ", " + ev.city : ev.venueName; }

    function countdown(ms) {
      var c = S.countdownParts(ms);
      if (c.kind === "days") return I.t("count.days", { d: c.d, h: c.h });
      if (c.kind === "hours" && c.h === 0) return I.t("count.mins", { m: c.m });
      if (c.kind === "hours") return I.t("count.hours", { h: c.h, m: (c.m < 10 ? "0" : "") + c.m });
      return I.t("count.soon");
    }

    function links(el, ev) {
      if (!el) return;
      el.textContent = "";
      var items = ev ? [["link.tickets", ev.ticketUrl], ["link.details", ev.officialDetailsUrl], ["link.map", ev.verifiedMapUrl]] : [];
      items.forEach(function (item) {
        if (!item[1]) return;
        var a = document.createElement("a");
        a.href = item[1];
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = I.t(item[0]);
        el.appendChild(a);
      });
      el.hidden = !el.childNodes.length;
    }

    function renderRow(row, t, fresh) {
      var id = row.getAttribute("data-artist");
      var kind = "unavailable", ev = null, notice = null;
      if (!state.failed && state.norm) {
        var pick = S.selectForArtist(state.norm, id, t);
        ev = pick.event;
        notice = pick.notice;
        kind = pick.state;
      }
      var hardStale = fresh === "hard-stale";
      var tonight = kind === "upcoming" && S.isTonight(ev, t);
      var shown = kind === "conflict" ? "unavailable"
        : kind === "live" && hardStale ? "upcoming"
        : tonight && !hardStale ? "tonight"
        : kind;
      var label = I.t("status." + shown);
      if (ev && ev.isDemo) label += " · " + I.t("demo");

      row.setAttribute("data-state", shown);
      put(slot(row, "status"), label);

      if (ev) {
        put(slot(row, "venue"), place(ev));
        put(slot(row, "date"), when(ev, ev.startMs));
      } else if (kind === "none") {
        put(slot(row, "venue"), I.t("none.line"));
        put(slot(row, "date"), I.t("none.hint"));
      } else {
        put(slot(row, "venue"), I.t(kind === "conflict" ? "conflict.line" : "unavail.line"));
        put(slot(row, "date"), I.t("unavail.hint"));
      }

      put(slot(row, "notice"), notice
        ? I.t("notice." + notice.status, { venue: notice.venueName, date: when(notice, notice.startMs) })
        : "");

      if (ev && !hardStale) {
        put(slot(row, "count-label"), I.t(kind === "live" ? "count.status" : "count.starts"));
        put(slot(row, "count"), kind === "live"
          ? I.t("count.on", { time: S.formatTime(ev.endMs, ev.venueTimeZone) })
          : countdown(ev.startMs - t));
      } else {
        put(slot(row, "count-label"), "");
        put(slot(row, "count"), "");
      }

      var detail = ev
        ? I.t("detail.set", { venue: place(ev), start: when(ev, ev.startMs), end: when(ev, ev.endMs) }) +
          (ev.isDemo ? " " + I.t("detail.demo") : "")
        : I.t(kind === "none" ? "none.line" : "unavail.line");
      put(slot(row, "detail-set"), detail);
      links(slot(row, "detail-links"), ev);

      var key = shown + ":" + (ev ? ev.publicId : "");
      if (!firstRender && seen[id] !== key && kind === "live" && !hardStale && liveEl) {
        liveEl.textContent = I.t("announce.live", { name: names[id] || id, venue: ev.venueName });
      }
      seen[id] = key;
    }

    function renderShows(t) {
      var list = !state.failed && state.norm ? S.collectiveShows(state.norm, t) : [];
      if (heroEl) {
        heroEl.textContent = state.failed || !state.norm ? I.t("hero.unavail")
          : list.length ? when(list[0], list[0].startMs) + " · " + place(list[0])
          : I.t("hero.none");
      }
      if (!showsEl) return;
      showsEl.textContent = "";
      if (!list.length) {
        var p = document.createElement("p");
        p.className = "empty";
        p.textContent = state.failed || !state.norm
          ? I.t("unavail.line") + " " + I.t("unavail.hint")
          : I.t("shows.empty");
        showsEl.appendChild(p);
        return;
      }
      var ul = document.createElement("ul");
      ul.className = "shows__list";
      list.forEach(function (ev) {
        var li = document.createElement("li");
        li.className = "show";
        var live = ev.startMs <= t;
        var parts = [
          ["show__status", I.t(live ? "status.live" : S.isTonight(ev, t) ? "status.tonight" : "status.upcoming") + (ev.isDemo ? " · " + I.t("demo") : "")],
          ["show__date", when(ev, ev.startMs)],
          ["show__title", ev.title || place(ev)],
          ["show__venue", ev.title ? place(ev) : ""],
          ["show__lineup", I.t("shows.lineup", { names: ev.artistIds.map(function (a) { return names[a] || a; }).join(" · ") })]
        ];
        parts.forEach(function (part) {
          if (!part[1]) return;
          var el = document.createElement("p");
          el.className = part[0];
          el.textContent = part[1];
          li.appendChild(el);
        });
        var actions = document.createElement("p");
        actions.className = "show__links";
        links(actions, ev);
        if (actions.childNodes.length) li.appendChild(actions);
        ul.appendChild(li);
      });
      showsEl.appendChild(ul);
    }

    function render() {
      /* Until the first feed result, the published HTML stays as it is. */
      if (!state.norm && !state.failed) return;
      var t = now();
      var fresh = state.failed || !state.norm ? "unknown" : S.freshness(state.lastSuccessMs, t);
      rows.forEach(function (row) { renderRow(row, t, fresh); });
      renderShows(t);
      if (staleEl) {
        put(staleEl, fresh === "stale" || fresh === "hard-stale"
          ? I.t("stale", { time: S.formatDateTime(state.lastSuccessMs, "Asia/Bangkok", I.lang) })
          : "");
      }
      firstRender = false;
      if (opts.onRender) opts.onRender(t);
      plan();
    }

    /* One timer: the next minute boundary or the exact start/end of a set.
       It stops while the tab is hidden and when nothing is left to change. */
    function plan() {
      clearTimeout(timer);
      timer = null;
      if (document.hidden || state.failed || !state.norm) return;
      var delay = S.nextWake(state.norm, now(), state.lastSuccessMs);
      if (delay == null) return;
      timer = setTimeout(render, Math.min(delay, 2147483000));
    }

    function onVisibility() {
      if (document.hidden) { clearTimeout(timer); timer = null; }
      else render();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", render);
    I.onChange(render);

    return {
      /* envelope: the public feed. meta.lastSuccessMs: when it was last fetched successfully. */
      setData: function (envelope, meta) {
        var norm = S.normalize(envelope, { allowDemo: !!(meta && meta.allowDemo) });
        if (norm.invalid) return this.setFailed();
        state.norm = norm;
        state.failed = false;
        state.lastSuccessMs = meta && typeof meta.lastSuccessMs === "number" ? meta.lastSuccessMs : now();
        render();
        return norm;
      },
      /* A failed refresh keeps the last good facts and lets them age.
         With nothing to fall back on, every slot says the schedule is unavailable. */
      setFailed: function () {
        if (!state.norm) state.failed = true;
        render();
        return null;
      },
      reset: function () {
        state.norm = null;
        state.failed = false;
        state.lastSuccessMs = null;
        seen = {};
        firstRender = true;
      },
      render: render,
      destroy: function () {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pageshow", render);
      }
    };
  }

  /* Optional details open and close only when their button is used. */
  function disclosures(root) {
    [].slice.call(root.querySelectorAll(".artist__toggle")).forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      panel.hidden = true;
      panel.classList.add("is-disclosure");
      btn.hidden = false;
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var opening = panel.hidden;
        panel.hidden = !opening;
        btn.setAttribute("aria-expanded", opening ? "true" : "false");
      });
    });
  }

  window.CVScheduleUI = { mount: mount, disclosures: disclosures };
})();
