> Historical release notes for 001 only. For 001b use RELEASE-NOTES-1.1.0.md; old unarchive/editing instructions do not apply.

# Habit Calendar 001 — 1.0.1

Testing candidate maintained by harharhari, licensed under GPL-3.0-only.

- Monthly calendars, manual green/pink/clear marking, three-column habit list, custom header colors and retained monthly statistics.
- Fixed archived-calendar inconsistency: archiving now stores the verified aggregate report and its event IDs in a schema-2 marker. Calendar rendering uses only those IDs, and on-screen totals use that report. Late records stay on disk but are excluded and reported to the user.
- Archived months show their saved summary if original daily records are unavailable. Existing schema-1 archive markers use the saved report's IDs for compatibility.
- Restoring all original detail and removing the archive marker allows late records to be included again.
- Added cancellation checks before writes after plugin disable, owner-document DOM handling, and handled asynchronous toolbar failures.
- Added reproducible Node production build, official Obsidian ESLint configuration, lockfile, CI, release-asset verification and archive regression tests.

Install by downloading **main.js**, **manifest.json** and **styles.css** from this release's Assets and copying them to `.obsidian/plugins/habit-calendar-001/` in a test vault. Restart Obsidian and enable Habit Calendar 001. Source-code archives alone are not an installed plugin.

Real-device testing is being performed by the maintainer. The declared minimum Obsidian version and mobile compatibility remain to be confirmed through that testing before Community submission. This release is not an Obsidian Community approval.
