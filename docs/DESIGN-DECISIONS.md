# Version 1.1.6 design decisions

## Questions and confirmed answers

1. Should Details be a separate plugin page while leaving Obsidian's global explorer unchanged? **User: Yes.**
2. Should Habit list open an editor that writes Markdown, while raw Markdown remains available? **User: Yes.**
3. Should Save immediately offer the existing current-month overwrite confirmation? **User: Yes.**

## Additional design questions and selected defaults

4. Which hex formats should be accepted? Use #RRGGBB only, case-insensitive, saved uppercase. This preserves the existing stored format and avoids alpha/theme ambiguity.
5. Should a color choice show the actual shade on mobile too? Yes. Use a searchable popup chooser with text and swatch rather than browser-dependent colored native options.
6. Should custom reference colors appear in the chooser? Yes. Reload the editor after editing hex-color-list.md. Invalid reference rows are omitted; the file itself is preserved.
7. What happens if sync changes the list while editing? Reject the stale save. Copy unsaved edits, close/reopen the editor and reapply them to the latest list.
8. Should old notes or the global explorer be deleted? No. The plugin has no existing Welcome-page generator. Version 1.1.6 opens directly into calendars and never generates a Welcome page. Existing user notes are preserved.
9. Should editing a list change past months? No. Retained calendar snapshots and statistics stay frozen.
10. Should editing Y/N immediately delete a calendar? Only after Save and Yes. No keeps the displayed month intact while preserving the new list for future months.

## Final design

The main calendar page contains Previous, Choose month, Next, Habit list, Color reference, Apply habit list, Statistics, Details and Search habits. Details provides access to the tracker file structure. Habit list provides Add habit, Remove habit, text names, Y/N selections, a searchable reference-color chooser, custom hex entry and Save. The three-column Markdown file remains the persistent source of habit definitions. Save is explicit; changing fields alone does not write the file. Save before closing the editor.

The internal calendar view type and public plugin ID stay unchanged. The implementation uses Obsidian APIs and DOM controls without Node/Electron runtime dependencies. Mobile and tablets retain one calendar per row; narrow desktop panes adapt similarly. All OS-specific installation paths and native test limitations are in INSTALL-DOWNLOAD.md and PLATFORM-TESTING.md.
