# CERTIFIED_V10

Concept site for the Bangkok DJ collective Certified_V10. Static HTML, CSS and vanilla JavaScript, in English and Thai. No build step.

- Live: https://mpc0367.github.io/certified-v10/
- Client preview of the per-DJ schedule (fictional data): https://mpc0367.github.io/certified-v10/preview.html

This is an independent design study, not the collective's official site. Both pages carry `noindex` until the collective authorises an official launch.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The site. Complete and readable without JavaScript. |
| `preview.html`, `preview.js` | Client preview: demo schedules on a demo clock. |
| `schedule.js` | Schedule rules: validation, next-set selection, time zones, countdown, freshness. No DOM. |
| `schedule-ui.js` | Renders schedule state into the hero, shows list and artist rows. |
| `i18n.js` | English/Thai text and language state (`?lang=en` or `?lang=th`). |
| `main.js` | Menu, artist details, sound tabs, enquiry draft, feed loading. |
| `data/schedule.json` | The public schedule feed the site reads. Currently empty. |
| `tests/schedule.test.js` | Fixed-clock tests for the schedule rules. |
| `docs/` | Schedule feed contract and the asset manifest. |

## Run and test

Serve the folder with any static server and open it. To run the tests:

```
node --test tests/schedule.test.js
```

## Publishing a show or a DJ set

Add an occurrence to `data/schedule.json` and push to `main`. The format and the rules are in [docs/schedule-adapter.md](docs/schedule-adapter.md).

## Release and rollback

GitHub Pages serves `main`. The release before the October 2026 rebuild is tagged `v1-pre-upgrade`. To roll back, revert the upgrade commit and push:

```
git revert <commit>
git push
```
