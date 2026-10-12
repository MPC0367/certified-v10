# Schedule feed

The site shows each DJ's next public set from one public JSON file, `data/schedule.json`. Today that file is edited by hand and contains no events. When the collective's calendar is available, a sync job writes the same file and the site does not change.

## Envelope

```json
{
  "schemaVersion": 1,
  "sourceMode": "live",
  "provider": "manual",
  "publisher": "name of the person who approved this version",
  "sourceUpdatedAt": "2026-10-12T20:00:00+07:00",
  "events": []
}
```

The public site only accepts `"sourceMode": "live"`. Demo data uses `"fixture"` and `isDemo: true`, and is rejected everywhere except `preview.html`.

## Occurrence

| Field | Required | Notes |
| --- | --- | --- |
| `publicId` | yes | Unique. Duplicates are dropped. |
| `artistIds` | yes | Any of `mawon`, `ossy`, `tew`, `wichaya`, `maxlerr`. A shared bill is one occurrence listing every artist. |
| `venueName` | yes | |
| `city` | no | |
| `venueTimeZone` | yes | IANA name, for example `Asia/Bangkok` or `Australia/Brisbane`. |
| `startAt`, `endAt` | yes | ISO 8601 with an offset, for example `2026-10-17T22:00:00+07:00`. `endAt` must be after `startAt`. |
| `serviceDate` | no | `YYYY-MM-DD`. The night the set belongs to. "Tonight" is shown only when this matches today's date at the venue. A set that starts after midnight needs this to count as the previous night. |
| `status` | yes | `confirmed`, `cancelled` or `postponed`. |
| `public`, `approved` | yes | Both must be `true`. |
| `isCollectiveShow` | no | `true` lists the occurrence under Upcoming shows and in the hero. |
| `title` | no | Shown for collective shows. |
| `ticketUrl`, `officialDetailsUrl`, `verifiedMapUrl` | no | HTTPS only, and only on Instagram, LINE, YouTube, TikTok or Google Maps hosts. Anything else is dropped. |
| `sourceUpdatedAt` | no | |

No other field is read. Notes, invitees, budgets, private links and contact details must not be in the file at all, because the file is public.

## What the site does with it

- A set is "Playing now" from `startAt` until `endAt`, then the row moves to the artist's next set or to "No public set announced".
- Cancelled and postponed sets are never chosen as the next set. They show as a notice on the row until their end time.
- Two confirmed sets that overlap for the same artist are treated as a publishing mistake: that artist's row shows "Schedule is being updated" until it is fixed.
- The feed is fetched on load and every 15 minutes while the tab is visible. If a refresh fails, the last good data stays on screen. After 60 minutes without a successful refresh a "Last updated" warning appears, and after 24 hours countdowns and "Playing now" are switched off. If the feed has never loaded, every row says the schedule is unavailable.

These budgets (15 minutes, 60 minutes, 24 hours) are proposals to agree with the collective.

## Connecting a calendar later

GitHub Pages cannot hold credentials, so the browser never talks to a private calendar. The intended shape is:

1. A dedicated public calendar, or an export the collective approves.
2. A small scheduled job (for example a GitHub Action with the calendar credential stored as a repository secret) that reads it, keeps only the fields above, and commits `data/schedule.json`.
3. The job stops without writing if validation fails, so a bad sync cannot empty the schedule.

Still to be decided by the collective: the calendar provider, who approves entries, and the freshness budgets.
