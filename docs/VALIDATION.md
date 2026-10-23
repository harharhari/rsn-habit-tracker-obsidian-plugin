# Validation — Habit Calendar 001b 1.1.2

Prepared 22–23 October 2026. Nothing has been uploaded, released, made public or submitted by this preparation.

## Executed locally

- Official eslint-plugin-obsidianmd 0.4.2 recommended/API-aware rules: zero warnings/errors. Official manifest/license checks passed.
- Production build, metadata/version consistency, mobile manifest and runtime import checks passed. Runtime external imports are restricted to obsidian.
- 11 core and 28 mocked-vault integration tests passed: **39 JavaScript tests**.
- Six Python helper tests passed. Total automated logic/helper tests: **45**.
- Chromium and Playwright WebKit each passed desktop (1600×1000), narrow desktop pane (600px), phone (393×851), and tablet (1024×768): **eight browser scenarios**.
- Browser checks cover 60 calendars, six/one columns, no horizontal overflow, mobile control sizing, three-state marking, filtering, persistence across view recreation, absent crypto.randomUUID and portable month selection/invalid-year validation.
- Six release assets generated, with release SHA256SUMS covering five payloads. The installation ZIP retains LICENSE and NOTICE.

The commands underlying npm run check were executed directly with the bundled Node runtime because npm is not on the session PATH. Browser tests use external development tooling, never shipped in the runtime. WebKit ran on Linux using temporary extracted browser libraries, with no system package installation.

## Regression coverage

Exact warning/default No, declined choice persistence, stale/reset approvals, full current-month resets, revision-tagged offline writes, month rollover, immutable historical snapshots despite late or corrupt events, legacy archive fallback, deleted detail, custom colors, disable/shutdown guards and helper idempotence remain covered. Added tests exercise the portable month picker and Windows-style CRLF/BOM input with Unicode names and portable vault paths.

## Evidence limits and required next steps

All browser scenarios mock Obsidian APIs. Linux WebKit is neither Safari on macOS nor iOS WKWebView. No native Windows, macOS, iOS/iPadOS or Android 1.1.2 acceptance run is claimed. GitHub Actions matrix jobs and hosted Community review are pending until upload/submission. The maintainer reported 1.1.1 working on Ubuntu 24.04.3 and Android phones; that is historical evidence, not a new 1.1.2 test.

Latest stable OS/app versions are targets, not recorded version numbers. Record exact versions and devices using TEST-RESULTS-TEMPLATE.md. Test the manifest's Obsidian 1.7.2 minimum or revise it appropriately before claiming tested compatibility. No fresh dependency-vulnerability audit or security certification is claimed.

Follow PLATFORM-TESTING.md and TESTING-CHECKLIST.md using downloaded GitHub release files. Actual Sync, iCloud, lifecycle/background behaviour and native installation require device tests.

## Reproducing checks

Install Node.js 22+ and npm. Run npm ci --ignore-scripts, npm run check, and on Linux npm run test:helper. Optional browser tooling and environment variables are documented in PLATFORM-TESTING.md. Inspect the three-OS Actions artifacts and compare release checksums before selecting release attachments.

## Final package verification

A clean copy of the prepared source rebuilt all six release files byte-for-byte. The public source includes generic examples only. The editable tutorial has 38 slides. Source and release checksums are separate and must be used in their respective directories.
