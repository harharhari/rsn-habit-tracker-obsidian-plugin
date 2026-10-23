# Habit Calendar 001b — first-use tutorial

Version 1.1.2 · harharhari · GPL-3.0-only

This tutorial uses two habits in a separate test vault. Installation and migration are covered in [Setup and use](SETUP-AND-USAGE.md). The test checklist is [here](TESTING-CHECKLIST.md).

## 1. Open your first month

Enable Habit Calendar 001b. Press Ctrl+P on Linux/Windows or Command+P on macOS and run **Habit Calendar 001b: Open current month**. On mobile use the command palette. For October 2026 the title is **2026-10 October 2026**. A new empty vault initially has no habit calendars.

## 2. Choose header colors

Click **Color reference**. The note is `Habit Tracker/hex-color-list.md`. Switch to Reading view to see the Color Shade column. Find lightgreen (#90EE90) and lightblue (#ADD8E6). Copy the hex codes yourself.

The reference contains 147 CSS3 named colors. Its names are labels, not values you can substitute for hex codes in the habit list. Changes here never change your habit calendars automatically.

## 3. Add your habits

Click **Habit list**, switch to Source mode, and put these rows below the existing table header:

```markdown
| Walking | Y | #90EE90 |
| Reading | Y | #ADD8E6 |
| Yoga | N | #FFDAB9 |
```

Save the note. The plugin adds hidden stable habit-ID comments. Preserve these comments on subsequent edits, especially renames.

The warning says:

> The current months entries will be overwritten and there would be loss of data

For this new empty month choose **Yes**. Two calendars appear: Walking and Reading. Yoga is not displayed because its flag is N. Desktop shows up to six calendars per row; mobile shows one.

## 4. Record activity

Click today's date in Walking once: green. Click it again: pink. Click a third time: unmarked. You can populate earlier dates in the current month. Future dates and previous months cannot be edited.

Mark a few dates, open **Statistics**, then restart Obsidian and verify the entries persisted. Completion is green days divided by elapsed calendar days, without schedules. Blank/pink days break streaks.

## 5. Practise No before Yes

Edit Walking's header code to #FFDAB9, keeping its habit-ID comment. Save. Choose **No** in the warning.

The current calendar retains its old header and marks. Your edited habit-list file remains edited; No does not undo the text edit. The same declined edit is not prompted every minute. Click **Apply habit list** to reconsider it.

Now choose **Yes**. Both current calendars are rebuilt and ALL current-month marks disappear, including Reading's marks even though you changed only Walking. The current statistics restart accordingly. A pre-reset recovery snapshot is retained under `Habit Tracker/System/Backups/`; there is no one-click undo.

Use one deliberate batch of list edits to avoid repeated resets. Finish sync before replacing a month and let the replacement sync before marking on another device.

## 6. Add a custom color

In Source mode, append this row to the existing color-reference table:

```markdown
| My lavender | #B8A9E8 | |
```

Return to Reading view. The plugin paints the blank third cell using the Hex Code column. Copy #B8A9E8 into the habit list if desired. Applying that habit-list change requires the same destructive Yes/No confirmation. Your custom color row itself survives refresh and upgrades.

## 7. Add, hide, delete, reorder, or rename habits

- Add a row with Y to include a new calendar.
- Change Y to N or delete a row to remove its current calendar after confirmation.
- Move whole rows to change calendar order.
- Rename the visible name while preserving the hidden ID comment.

Every meaningful catalog change prompts before changing the current month. Yes always resets the entire current month. No leaves the active month intact. Whitespace-only table formatting does not reset anything.

## 8. Review previous months

Use Previous or Choose month. The last saved historical report and calendar are frozen; current list edits and late synced entries cannot change them. Prior days are read-only. A frozen report keeps its saved as-of date, even if that date was before month-end.

If an older 001 archive no longer has its original detail records, only its retained totals may be available. Do not infer missing history from the current habit list.

## 9. Start a new month

When Obsidian is running on the first, or first opens afterward, the new month uses the then-current habit list. This includes edits for which you chose No in the previous month. New marks start blank. Previous months remain frozen.

Generation while Obsidian is closed requires the optional Linux helper described in SETUP-AND-USAGE.md, with the computer running. It is not required for ordinary plugin use.

## 10. Keep data and backups

Retain `Habit Tracker/Statistics/` and `Habit Tracker/System/`. Only purge older monthly pages or detail records after checking their frozen snapshots and backups. Disabling or uninstalling the plugin leaves your vault data in place.

When migrating from 001, disable it on EVERY device before enabling 001b. Both variants use the same data directory, but 001 cannot interpret 001b reset records.

## 11. Windows, Mac, iPhone and iPad

Installation for all platforms is in INSTALL-DOWNLOAD.md. Desktop commands use Ctrl+P on Windows/Ubuntu and Command+P on Mac. Phone/tablet users open the command palette from the ribbon/menu. Choose month now offers a month dropdown and four-digit year; no browser-specific month input is required. iPad retains one column, including landscape. Narrow desktop split panes also switch to one column. See the updated PowerPoint for platform-specific walkthroughs.
