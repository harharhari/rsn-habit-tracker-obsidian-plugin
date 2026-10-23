# Habit Calendar 001b 1.1.2

Targets Windows 11, Ubuntu 24.04.3, current stable macOS, Android, iOS and iPadOS with a shared plugin bundle. The plugin ID remains habit-calendar-001b and the existing vault format is unchanged.

- Replaced browser-specific month input with an accessible native month dropdown and four-digit year field, with validation and Enter support.
- Enlarged mobile toolbar controls and search to at least 44px height, with 16px text. Phone and tablet calendars remain one column.
- Added pane-width responsiveness for narrow desktop split views while keeping six columns in a wide view.
- Added Windows CRLF/BOM and Unicode-name persistence regression coverage.
- Added .gitattributes to keep source/build line endings consistent across operating systems, and a release check rejecting unexpected runtime imports.
- Extended GitHub Actions to Linux, Windows and macOS build/test jobs. These jobs check Node builds, not native Obsidian UI.
- Expanded Chromium/WebKit browser scenarios and platform-specific installation, verification and acceptance instructions.

Upgrade using matching 1.1.2 files in the existing plugin folder. Preserve data.json and the entire Habit Tracker directory. Upgrading code does not require accepting a habit-list reset. No automatic data migration or deletion occurs.

Platform targets are not a claim of real-device certification. Ubuntu/Android success was user-reported for 1.1.1. Version 1.1.2 must pass the maintainer's real-device checklist before publication. See VALIDATION.md for executed checks and pending device evidence.
