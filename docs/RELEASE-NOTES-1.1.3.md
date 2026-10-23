# rsn habit calendar one b 1.1.3

Changes plugin ID from habit-calendar-001b to **rsn-habit-calendar-one-b** and display name to **rsn habit calendar one b**, as requested after the Community directory rejected the former ID. Author harharhari; GPL-3.0-only.

- Adds explicit local checks for the current lowercase-letter/hyphen-only ID rules, including forbidden words/suffixes.
- Uses the release manifest ID for installer paths. Adds optional, non-overwriting legacy settings import with tests.
- Starts versions.json at 1.1.3 for the new identity; previous GitHub release tags remain historical.
- Updates release ZIP name, documentation, platform installation paths, tutorial and upload inventory.
- Preserves vault data paths, record format, habit-calendar Markdown blocks and the internal view type for workspace continuity.
- Keeps the 1.1.2 portable month picker and desktop/mobile/tablet layout.

**Existing users must follow MIGRATION-1.1.3.md.** Disable Habit Calendar 001b on all devices, install in the new folder, copy wanted data.json before enabling, and preserve Habit Tracker. Never run both identities together. Hotkeys need reassignment. Standard updates of the old identity will not automatically perform this migration.

Native-device, real sync and hosted review acceptance remain pending. Local checks do not establish name/ID uniqueness in the Community directory or guarantee approval.
