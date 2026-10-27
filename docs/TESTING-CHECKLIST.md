> Upgrading from Habit Calendar 001b 1.1.1/1.1.2: follow [MIGRATION-1.1.3.md](MIGRATION-1.1.3.md) first. The ID and installation folder change. Disable the old plugin on all devices and copy wanted settings before enabling the new one.

# User acceptance checklist — 001b 1.1.7

Use downloaded GitHub release assets in a separate test vault. Record Obsidian version, OS, device, plugin version, and pass/fail evidence. Automated tests do not replace these real-device checks.

## Installation and basic use

- [ ] Download all six files and verify five checksum results.
- [ ] Install under `.obsidian/plugins/rsn-habit-calendar-one-b/`, enable 001b, and confirm 001 is disabled.
- [ ] Open current month; title is YYYY-MM Month YYYY. Week starts Monday.
- [ ] Desktop wide view has six columns; narrow/mobile layout has one.
- [ ] Add two Y habits and one N habit. Save, read the exact warning, choose Yes. Only two calendars appear.
- [ ] Cycle dates none → green → pink → none. Current-month earlier dates work. Future dates are disabled.
- [ ] Restart and verify data persists.

## Editable colors

- [ ] Open the vault's hex-color-list.md in Reading view: 147 starter rows and visible swatches.
- [ ] Check green #008000, gray #808080, purple #800080, white/black borders, and gray/grey aliases.
- [ ] Add `| My shade | #123456 | |` at the bottom of the table. Reading view shows the shade.
- [ ] Change only Hex Code. Its displayed swatch updates, even if an old inline swatch is in the source.
- [ ] Invalid hex shows Invalid hex code. No habit-list dialog occurs just from editing this file.
- [ ] Refresh/restart/update plugin: custom color row survives.
- [ ] Copy a code manually into a habit header and test the confirmation below.

## Current-month destructive confirmation

- [ ] Mark at least two days in different habits and note the statistics.
- [ ] Rename, recolor, reorder, add, delete, and toggle Y/N in separate tests.
- [ ] Choose No: existing calendars/marks remain, and report bytes do not change from the list edit.
- [ ] Wait beyond the minute refresh and restart: the same rejected list is not repeatedly prompted.
- [ ] Use Apply habit list: dialog reappears.
- [ ] Escape/close behaves as No.
- [ ] Choose Yes: all marks clear, including unchanged habits; only current Y rows remain in list order; report resets.
- [ ] New marks after reset persist.
- [ ] System/Backups contains a pre-reset recovery file.
- [ ] Change the list again while the dialog is open (e.g. another device): stale Yes must not apply to the new list.
- [ ] Formatting-only edits do not prompt.

## History and late sync — synthetic fixture

The source package contains a fixture generator. Close Obsidian and create a NEW empty test vault first; keep the plugin disabled until fixture creation completes.

```bash
node scripts/test-vault.mjs create --test-vault "/absolute/path/to/empty-test-vault"
```

Enable 001b, open the previous month. It automatically freezes. Record the green mark, calendar header, and statistics. Close Obsidian and run:

```bash
node scripts/test-vault.mjs late --test-vault "/absolute/path/to/empty-test-vault"
```

- [ ] Reopen: prior green mark stays green, totals unchanged, late-record notice shown.
- [ ] Prior-month day buttons cannot be clicked; past statistics never refresh from late marks.
- [ ] Change current habit list and choose Yes: prior calendars/reports stay identical.
- [ ] In this disposable fixture, delete old Records files: schema-3 frozen calendar/details remain.
- [ ] Delete old monthly page: refresh does not recreate it; saved statistics remain accessible.
- [ ] At natural month rollover (or in a disposable clock-controlled environment), new month uses current list; previous report preserves its last saved as-of date.

## Two-device tests

- [ ] Linux + Android, then Linux + iPhone/iPad: mark separate days offline, sync, verify current generation merges.
- [ ] Sync fully, reset on primary, sync fully, then mark on secondary.
- [ ] Keep secondary offline before a reset, create an old-generation mark there, reconnect: it must not resurrect cleared marks.
- [ ] Ensure plugin settings sync does not unexpectedly re-prompt declined edits.
- [ ] Confirm your backup/restore includes Statistics and System, not just monthly pages.

## Publication gate

- [ ] Actual release downloads tested, not only local builds.
- [ ] GitHub Actions is green.
- [ ] README, GPL license, public author, ID/version, and release attachments match.
- [ ] Source made public only after testing; submit via current Community directory instructions.

## Identity migration from 1.1.2

- [ ] Use a copied 1.1.2 vault with current marks and frozen history. Back up both plugin settings and Habit Tracker.
- [ ] Disable Habit Calendar 001b on all devices before enabling rsn habit calendar one b.
- [ ] Install in rsn-habit-calendar-one-b, copy wanted legacy data.json and verify manifest ID equals folder name.
- [ ] Verify remembered No decisions, marks, custom colors and historical reports survive. No reset should be needed.
- [ ] Reassign hotkeys, check existing notes and reopen the calendar view.
- [ ] Complete Sync/iCloud transfer and repeat checks on each mobile device.
- [ ] Install from the Community browser after approval and confirm the new display name and version.

## Required 1.1.7 interface checks on every target platform

- Open current month without a Welcome page. Confirm the four main toolbar buttons and Search habits. Use Details for management buttons.
- Open Details. Expand Months, Records, Statistics and System; open both reference notes. Confirm the five exact tracker entries are hidden in the explorer, with Months and unrelated entries visible.
- Open Habit list. Add, rename and remove a habit. Verify Generate calendar offers only Y/N.
- Choose a named color by searching. Confirm its hex code and actual shade. Type a custom #123ABC value. Reject blank, named, malformed and shorthand colors without writing the list.
- Save a meaningful change and choose No: saved list changes, current marks/headers do not. Apply again and choose Yes: all current marks reset and Y/N/name/color changes apply. Past months/statistics remain unchanged.
- Edit the Markdown file while the editor is open, then attempt Save. Verify conflict rejection preserves the external edit.
- Add a custom color reference row and reopen the editor. Verify the new name/code/swatch appear.
- Check keyboard Tab/Enter, touch controls, scrolling and no horizontal overflow. Save, restart and verify persistence.
- Upgrade a populated 1.1.5 vault. Preserve data.json and all tracker files. Record exact OS/Obsidian versions rather than assuming latest.

## Required 1.1.7 native checks

- Main toolbar has exactly Previous, Choose month, Next, Details. Search habits still filters calendars.
- Habit list, Color reference, Apply habit list and Statistics are present on Details and absent from the main toolbar.
- Navigate to a historical month, open Details, open Statistics and return. Confirm the report and Back to calendars retain the displayed month. Restore/reopen the workspace and verify Details month state.
- Verify the five exact tracker paths disappear from the file explorer while Months and unrelated same-name folders stay visible. Test expanded folders and newly synced entries. Disable/re-enable the plugin and verify visibility restoration/reapplication.
- Confirm file bytes, locations, sync inclusion and backups are unchanged by hiding. This is not a security feature.
- Verify editor Y/N/color validation, Save Yes/No behavior, historical immutability and real sync using the earlier checklist.
- On Windows, Ubuntu, macOS, Android, iPhone and iPad record exact app, OS and theme versions. Explorer CSS tests use simulated markup locally; actual native behavior remains to be verified.
