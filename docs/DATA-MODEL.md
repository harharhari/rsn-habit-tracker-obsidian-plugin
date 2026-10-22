# Habit Calendar 001b data model

Plugin ID `habit-calendar-001b`; version 1.1.1. Data root remains `Habit Tracker` for migration from 001. Do not run both variants against the same vault.

## Vault layout

```text
Habit Tracker/
  habit-tracker-list.md
  hex-color-list.md
  Months/YYYY-MM.md
  Records/YYYY-MM/UUID.md
  Statistics/YYYY-MM-statistics.md
  System/config.md
  System/Months/YYYY-MM.md
  System/Archived/YYYY-MM.md
  System/Backups/YYYY-MM-UUID.md
```

Monthly pages contain the portable `habit-calendar` fenced block. Statistics and system files contain fenced JSON metadata. Do not manually rewrite generated metadata. `System/Months` tombstones prevent recreation after deletion. Custom color rows live only in the editable color-reference file, which is never refreshed over user content.

## Events and revisions

Events retain schema 1 with unique UUIDs and UTC timestamps. A new event type, `reset`, is understood only by 001b. It contains the complete parsed catalog (including N rows) approved in the dialog.

- `create`: original catalog for a month. Concurrent initial events merge enabled habits for compatibility.
- `catalog`: legacy 001 catalog update; replayed for migration only. 001b never emits it.
- `reset`: replaces the entire current catalog and clears active marks. Only enabled habits are displayed.
- `mark`: habit, date, green/pink/none, and generation. A null/absent generation belongs to the original month. New marks after a reset carry that reset event's ID.

The latest reset by `(at, id)` wins deterministically. Only marks for that exact generation are considered; prior/other generations cannot restore cleared entries even if their timestamps are newer. A generation-tagged mark arriving before its reset causes a wait-for-sync error. All source IDs are retained for completeness checks, including superseded events. Only past-month record sets may be purged.

The reduced state includes `catalog`, `generation`, enabled `habits`, `marks`, and `sourceIds`. Semantic catalog comparison catches removal, Y/N, name, color, and order changes, including edits to N rows; formatting-only edits are ignored. Hidden stable IDs are preserved when renaming.

## Confirmation

List changes are debounced and processed through a single promise queue. A modal defaults to No; Escape/close also mean No. It describes that Yes resets EVERY mark, not only changed habits. On approval, the plugin rechecks the current month, exact catalog, record completeness, and lock state. Stale approval is not applied.

Before reset, the plugin writes a recovery snapshot under System/Backups. The accepted reset is an immutable event. Then it writes the current monthly page and updates the report. If interrupted after the reset, refresh regenerates the report from the accepted event. Old records remain as recovery evidence but no longer count.

No leaves month data unchanged; the editable list itself is not reverted. A semantic list signature/month are stored in plugin `data.json` to avoid repeated prompts. This preference can sync with plugin settings. Apply habit list explicitly retries a declined edit. A new month always starts from the current list without overwriting an existing month.

## Reports and frozen history

Current reports use schema 1 and include `calendarState` alongside totals, per-habit statistics, as-of date, and source IDs. A report is only replaced when all previously recorded source IDs are present. This prevents partial sync or deletion from reducing totals silently.

All prior months are locked, even if no archive marker exists yet. On first observation after rollover, a schema-3 archive marker freezes the last saved report and complete calendar state. The historical report file is not rewritten. Its as-of date remains the last calculation date; percentages are not silently converted to a full-month denominator. If no report exists but complete records are available, a report is created once and frozen.

Schema-3 markers contain `snapshot` (saved statistics) and `calendarState`. Both rendering and totals use the frozen values. Late records are retained outside the snapshot and counted in a notice. Deleting detail records does not remove the frozen state. Removing a marker does not unlock a past month: the retained report reconstructs the freeze, using its calendarState when available.

Legacy schema-2 archives use their saved statistics snapshot; schema-1 archives use retained report source IDs. Only those event IDs may be replayed. Missing legacy details mean statistics-only display. Such history is never guessed from the current habit list.

There is no ordinary unarchive command in 001b. An old version's manual unarchive instructions no longer apply. External editors and sync conflict resolution can replace files outside the plugin's control; backups remain necessary. Offline late marks are intentionally excluded once a snapshot has frozen. Sync all devices before rollover/replacement.

## Statistics

No schedules. Green / elapsed calendar days, rounded to two decimals. Pink and unmarked break streaks. Streaks are month-local. Current elapsed days follow System/config.md timezone (default Asia/Kolkata). Retained as-of dates are shown explicitly. Deleted monthly pages/records do not delete Statistics or System snapshots.

## Colors

147 factual name/hex pairs from https://www.w3.org/TR/css-color-3/#svg-color. Hex codes are six-digit RGB. Reading-view swatches are generated only for the exact vault color-reference path and matching three-column table, using a strict hex validator and DOM text/style properties. No HTML strings are evaluated by the plugin and no remote swatch assets are requested. Custom rows need only name and hex; third cell can be blank.
