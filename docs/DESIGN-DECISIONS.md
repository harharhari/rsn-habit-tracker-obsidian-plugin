# 1.1.9 design questions and combined decisions

No new preference is required for these review fixes. The following answers use the user's previously confirmed behavior and conservative implementation defaults.

1. Keep exactly the five tracker entries hidden? Yes; Months and unrelated folders remain visible.
2. Remove !important completely? Yes, and enforce a release-time guard alongside the existing no-:has guard.
3. How should expanded folders be handled? Collapse and conceal the exact child container even if its inline display is block. Test fixed inline height as well.
4. Add a DOM observer or polling? No; retain CSS-only matching. Native DOM/theme changes still require acceptance testing.
5. Change toolbar, editor or statistics? No. Four main buttons and Search remain. Management stays in Details, with displayed-month statistics and current-month overwrite confirmation.
6. Which manifest is authoritative for publication? The tagged source and current default branch must agree with the actual release attachment; all fields must match.
7. Should checks silently overwrite a mismatch? No. Fail with a diagnosis so an unintended version cannot be published silently.
8. When should remote consistency be checked? Before attestation, after draft upload, and again after publication. Later repository changes require another audit.
9. Preserve existing released tags and user data? Yes. Use new tag 1.1.9, preserve old releases, data.json and the entire Habit Tracker folder.
10. Are automated browser tests sufficient for all devices? No. Record native Obsidian, OS and theme versions on Windows, Ubuntu, macOS, Android, iPhone and iPad; tests remain pending until performed.

Final design: a CSS-only sidebar correction plus explicit release alignment checks, version 1.1.9 metadata, unchanged plugin identity/data format, and updated installation and publication documentation. No additional features or migration are needed. Navigation remains documented in navigation.drawio.
