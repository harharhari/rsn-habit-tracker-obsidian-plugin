# Version 1.1.7

The main calendar toolbar now has only Previous, Choose month, Next and Details. Search habits stays on the main page. Habit list, Color reference, Apply habit list and Statistics have moved to Details. Historical snapshot verification is also available on Details rather than the calendar.

Details saves the displayed month in its workspace state. Statistics and Back to calendars use that month. Applying the habit list still targets the actual current month and retains the existing destructive Yes/No confirmation. The month chooser starts at the displayed month.

The file explorer hides exactly these paths while the plugin stylesheet is active:
- Habit Tracker/Records
- Habit Tracker/Statistics
- Habit Tracker/System
- Habit Tracker/habit-tracker-list.md
- Habit Tracker/hex-color-list.md

Habit Tracker/Months and unrelated paths remain visible. Files are not deleted, renamed, moved or excluded from sync. Details provides access to them. Disabling the plugin restores normal explorer visibility when Obsidian unloads its stylesheet. This is visual simplification, not access control or encryption.

The selectors depend on Obsidian's current file-explorer DOM. Test against the actual app/theme on each target platform. Unsupported browsers or themes that replace that DOM may leave entries visible; stored data stays intact.

Version 1.1.7 keeps the plugin ID, schema, Y/N editor, hex-color validation, save-conflict handling and frozen historical reports. Upgrade by replacing only main.js, manifest.json and styles.css. Preserve data.json and all Habit Tracker files.
