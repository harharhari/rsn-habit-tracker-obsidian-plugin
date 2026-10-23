# Final 1.1.2 design and clarification record

## Confirmed answers

- Distribution: same habit-calendar-001b ID, new version 1.1.2, harharhari, GPL-3.0-only and the same GitHub repository.
- Platforms: Windows 11, Ubuntu 24.04.3 and latest stable macOS/Android/iOS/iPadOS/Obsidian at test time. Exact device/app versions are not yet provided.
- iPhone/iPad setup: Obsidian Sync first, plus manual installation and Apple-only iCloud guidance.
- Tablets: one calendar per row, including iPad landscape. This matches phones.
- Public examples: generic only. Personal 71-habit list stays private.

## Additional design questions and decisions

| Question | Answer / chosen default | Consequence |
|---|---|---|
| Rename plugin ID or only release version? | Only version changes | Existing installations and vault data remain compatible |
| Separate OS-specific binaries? | One Web-API/Obsidian-API bundle | Same release files for all six target device types |
| How should month selection work across browser engines? | Month dropdown plus numeric year text field | Avoids reliance on native input type month |
| Tablet grid density? | User selected one column | No multi-column iPad mode in 1.1.2 |
| How should narrow desktop panes behave? | One column at 700px content width or below | Split views remain usable without tiny six-column cards |
| What happens to 1.1.1 records? | Preserve format and ID | No migration/reset on code upgrade |
| Should list changes preserve current marks? | Existing full-reset-on-Yes requirement remains | Color/name/Y/N edits still require explicit replacement |
| Which cloud service spans all platforms? | User chose Obsidian Sync first | Optional paid external service, not a plugin requirement |
| Can iCloud and Sync run on one vault? | Separate alternatives | Avoid conflicting sync engines |
| Which versions were actually tested? | Record exact numbers during acceptance | Latest stable targets do not become fabricated test results |
| Add background generation on phones? | No, outside this release | Month appears while open or next launch; Linux helper remains optional |
| Should the source build on every desktop OS? | Three-OS GitHub Actions matrix | CI tests Node builds, separate from native Obsidian tests |

## Combined final design

Keep the event/revision/frozen-report architecture. Refactor the month picker and touch sizing, make desktop layout respond to pane width, enforce portable runtime imports and deterministic text line endings, and add meaningful regressions. Deliver one six-asset release, a clean GitHub source tree, source/release checksums and an expanded editable tutorial. Preserve history and custom colors when upgrading. Document Windows/macOS file-manager and checksum differences, Android device storage, iOS Sync setup and the Mac-assisted iCloud route. Real-device and hosted acceptance remain explicit gates. All diagrams remain editable draw.io files.
