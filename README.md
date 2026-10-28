# CERTIFIED_V10

Concept site for the Bangkok DJ & MC collective Certified_V10, in English and Thai.

Live: https://mpc0367.github.io/certified-v10/

`index.html` is the homepage: one self-contained file with its styles, script and images embedded. `img/og.jpg` is the link-preview image.

The other pages (DJ profiles, sets, events, booking, internships, 404, sitemap) are generated from the files in `data/` by `tools/build.mjs`, which also copies the homepage's styles and Thai dictionary into `assets/site.css` and `assets/site.js` so every page matches.

## Updating the site

Edit the data, rebuild, commit:

```
node tools/build.mjs
```

- `data/artists.json`: DJ bios (English and Thai), styles, photos, featured set.
- `data/sets.json`: YouTube sets. A new set needs its thumbnail saved as `assets/img/sets/<video id>.jpg`.
- `data/events.json`: shows. Upcoming shows appear on the events page, the DJ pages and the schedule posters; past shows move to "Past" by themselves.
- `data/merch.json`: the merch page. It currently holds placeholders (drawn artwork, no prices) and stays out of search results. Fill in real names, prices (THB), options and drop details, add photos as `assets/img/merch/<file>.jpg` via each item's `"image"`, then set `"status"` to `"live"`.
- `data/intake.json`: internship intake. Set `"status"` to `"open"` or `"closed"`. The homepage and the internships page read this file directly, so no rebuild is needed.

Club dates on DJ schedules are sample data, labelled Demo, until a real booking calendar is connected. Booking enquiries are composed on the page and sent by the visitor through LINE or Instagram; the site itself stores nothing.

Independent design study, not the collective's official site.
