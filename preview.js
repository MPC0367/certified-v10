/* CERTIFIED_V10 — client preview of the per-DJ schedule.
   Fictional fixtures and a demo clock, fed through the same normalizer and
   renderer as the public page. Nothing here is a confirmed appearance. */
(function () {
  "use strict";

  var doc = document;
  var I = window.CVI18n;
  var S = window.CVSchedule;
  var UI = window.CVScheduleUI;
  var NAMES = { mawon: "MAWON", ossy: "OSSY", tew: "TEW", wichaya: "WICHAYA", maxlerr: "MAXLERR" };
  var START = "2026-10-12T20:00:00+07:00";
  var DURING = "2026-10-12T22:30:00+07:00";

  function fixture(over) {
    var base = {
      public: true, approved: true, isDemo: true, status: "confirmed",
      city: "Bangkok", venueTimeZone: "Asia/Bangkok", sourceUpdatedAt: START
    };
    for (var k in over) base[k] = over[k];
    return base;
  }

  /* TEW tonight with MAXLERR on the same bill, OSSY later tonight, MAWON later
     in the week, WICHAYA with nothing announced. */
  function fixtures(scenario) {
    return [
      fixture({
        publicId: "demo-tew-01", artistIds: ["tew", "maxlerr"], venueName: "Upper House BKK",
        startAt: "2026-10-12T22:00:00+07:00", endAt: "2026-10-13T00:00:00+07:00", serviceDate: "2026-10-12",
        status: scenario === "cancelled" ? "cancelled" : "confirmed"
      }),
      fixture({
        publicId: "demo-ossy-01", artistIds: ["ossy"], venueName: "House of Savoy",
        startAt: "2026-10-12T23:00:00+07:00", endAt: "2026-10-13T01:00:00+07:00", serviceDate: "2026-10-12"
      }),
      fixture({
        publicId: "demo-mawon-01", artistIds: ["mawon"], venueName: "Ratch Hour",
        startAt: "2026-10-17T22:00:00+07:00", endAt: "2026-10-18T00:00:00+07:00", serviceDate: "2026-10-17"
      })
    ];
  }

  try { I.init(); } catch (e) { if (window.console) console.error("[cv] language", e); }
  try { UI.disclosures(doc); } catch (e) { if (window.console) console.error("[cv] details", e); }

  var select = doc.getElementById("scenario");
  var resetBtn = doc.getElementById("reset");
  var clock = doc.getElementById("clock");
  var announce = doc.querySelector('[data-slot="announce"]');
  var controls = doc.getElementById("controls");
  if (!select || !resetBtn || !clock || !controls) return;

  var anchor = Date.parse(START);
  var wall = Date.now();
  function now() { return anchor + (Date.now() - wall); }

  var ui = UI.mount({
    names: NAMES,
    now: now,
    onRender: function (t) {
      clock.textContent = S.formatDateTime(t, "Asia/Bangkok", I.lang) + " · " + I.t("preview.clock.suffix");
    }
  });

  function show(tell) {
    var scenario = select.value;
    anchor = Date.parse(scenario === "playing" ? DURING : START);
    wall = Date.now();
    ui.reset();
    if (scenario === "unavailable") {
      ui.setFailed();
    } else {
      ui.setData(
        { sourceMode: "fixture", events: scenario === "empty" ? [] : fixtures(scenario) },
        { allowDemo: true, lastSuccessMs: now() - (scenario === "stale" ? 61 * 60000 : 0) }
      );
    }
    if (tell && announce) {
      announce.textContent = I.t("preview.changed", { name: select.options[select.selectedIndex].textContent });
    }
  }

  select.addEventListener("change", function () { show(true); });
  resetBtn.addEventListener("click", function () { select.value = "upcoming"; show(true); });
  controls.hidden = false;
  show(false);
})();
