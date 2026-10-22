# Habit Calendar 001b 1.1.0

New plugin ID: `habit-calendar-001b`. Public author: harharhari. GPL-3.0-only.

- Adds an editable 147-color CSS3 reference with Reading-view swatches and custom rows.
- Requires Yes/No confirmation before applying current-month habit-list edits. Yes clears ALL current-month marks and rebuilds only Y calendars with updated names, colors, and order. No preserves the current month.
- Freezes previous calendars and statistics, including the saved as-of date. Late sync cannot change frozen displays.
- Uses revision-tagged marks so old offline entries cannot resurrect after reset.
- Includes a production build, official Obsidian lint/metadata checks, regression tests, six release assets, and SHA256SUMS.

Disable Habit Calendar 001 on every device before using 001b on the same vault. Both use `Habit Tracker/`. Back up first; old 001 cannot read reset events. Real-device and sync acceptance testing is required before Community publication.

Install the loose main.js, manifest.json, styles.css and hex-color-list.md in `.obsidian/plugins/habit-calendar-001b/`, or extract the installation ZIP. Verify downloads using SHA256SUMS. Full setup and migration instructions are in docs/SETUP-AND-USAGE.md.
