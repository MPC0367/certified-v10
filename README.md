# CERTIFIED_V10

Concept site for the Bangkok DJ & MC collective Certified_V10, in English and Thai.

Live: https://mpc0367.github.io/certified-v10/

`index.html` is the homepage: one self-contained file with its styles, script and images embedded. `img/og.jpg` is the link-preview image.

The other pages (DJ profiles, sets, events, booking, merch, internships, 404, sitemap) are generated from the files in `data/` by `tools/build.mjs`, which also copies the homepage's styles and Thai dictionary into `assets/site.css` and `assets/site.js` so every page matches.

## Updating the site

Edit the data, rebuild, commit:

```
node tools/build.mjs
```

- `data/artists.json`: DJ bios (English and Thai), styles, photos, featured set.
- `data/sets.json`: YouTube sets. A new set needs its thumbnail saved as `assets/img/sets/<video id>.jpg`.
- `data/events.json`: public shows only, with verified facts. Times are Bangkok local time with the +07:00 offset; leave unknown end and set times out. Change `"updated"` whenever the schedule changes; it is printed on the DJ pages and their schedule posters. Upcoming shows appear on the events page, the DJ pages and the posters; past shows move to "Past" by themselves.
- Background reacting to a set: `node tools/levels.mjs <audio file> <YouTube video id>` writes `data/levels/<id>.json` (25 readings a second of loudness, bass, mids, highs and detected kicks); rebuild, and the sets page background then follows that set while it plays: kicks flash (capped at three a second for photosensitive viewers), bass swells, mids warm the light, hi-hats shimmer. Sets without one get a gentle steady pulse. It needs ffmpeg, and the audio must be the same recording that is on YouTube or it will drift out of time.
- `data/merch.json`: the merch page and one page per product. It currently holds placeholders (drawn artwork, no prices, ordering switched off) and stays out of search results. Fill in real names, prices (THB), sizes, options and drop details, add photos as `assets/img/merch/<file>.jpg` via each item's `"image"`, then set `"status"` to `"live"`. Taking orders also needs a shop provider (for example a hosted checkout) and hosting that allows selling; GitHub Pages does not.
- `data/intake.json`: internship intake. Set `"status"` to `"open"` or `"closed"`. The homepage and the internships page read this file directly, so no rebuild is needed. Applications still go by email; closing the intake hides the application details but cannot stop someone emailing.

Club dates on DJ schedules are sample data, labelled Demo, until a real booking calendar is connected. Booking enquiries are composed on the page and sent by the visitor through LINE or Instagram; the site itself stores nothing.

## Where the content comes from

- DJ bios: the descriptions on Certified's own YouTube channel (@certified_v10), quoted as such on each page.
- DJ sets and their thumbnails: the official @certified_v10 YouTube uploads.
- Event facts and posters: the organisers' public listings and Certified's Instagram (@certified_v10). Wicked Sessions tickets: Nightify.
- Portraits and the unit photo: generated concept artwork, as the footer says. Replace them with approved photography before treating this as an official site.
- Merch artwork: drawn placeholders, not product photos.

## Rolling back

Every release is one commit with its build number (R13 onwards) in the message and in the footer. To undo a release, revert its commit (`git revert <commit>`) and push; GitHub Pages redeploys in about a minute. The last homepage-only build is R26 (`40aab61`).

Independent design study, not the collective's official site.
