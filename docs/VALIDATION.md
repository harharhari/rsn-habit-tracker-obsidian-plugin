# Validation — Habit Calendar 001b 1.1.1

Checked locally on 20 October 2026. Real-device acceptance belongs to the maintainer and remains pending. Nothing has been pushed, published, or submitted by this preparation.

## Checks executed

- The commands comprising `npm run check` were executed directly with the bundled Node.js runtime and passed (npm is not on this session’s PATH). Runs official Obsidian ESLint checks, production build, JavaScript tests, release metadata/asset consistency, ZIP packaging and checksum generation.
- Official `eslint-plugin-obsidianmd` 0.4.2 recommended and API-aware rules: zero warnings/errors. Official manifest/license validators also passed.
- 11 core tests and 26 mocked-Obsidian integration tests: passed.
- `npm run test:helper`: 6 Python helper tests passed.
- All 147 starter color names and hex values compared with the W3C CSS Color 3 table: exact match, including aliases.
- Six release attachments generated. SHA256SUMS covers the four loose assets and installation ZIP. ZIP contents verified against the loose assets.

## Regression coverage

Yes/No handling; exact warning and default No; preservation of declined choices across reload; stale approval when the list changes; Y/N/deletion/rename/order comparison; full current-month reset; revision-tagged offline marks; month rollover; frozen history despite late or corrupt late records; legacy archive fallback; deleted historical detail; preservation of custom color rows; shutdown guards; helper idempotence and no unauthorized reset.

## Scope and limits

Tests exercise the production bundle through mocked Obsidian storage and modal elements. They do not prove rendered swatches, platform UI, actual Sync behaviour, minimum-version compatibility, or hosted Community approval. Complete TESTING-CHECKLIST.md using fresh GitHub downloads on each target device.

The API lint floor is Obsidian 1.7.2, not a claim of device testing on that version. Runtime JavaScript/CommonJS is checked with API-aware ESLint; only the generic no-require-imports TypeScript restriction is disabled to permit Obsidian's CommonJS loading. No Obsidian recommended rule is disabled. Build utilities, mocks and generated code are outside runtime lint; the generated bundle is exercised by the integration tests.

ESLint 9.39.5 is pinned to match the official lint stack's dependency constraints. Reassess that development dependency during maintenance. No fresh dependency-vulnerability audit or release-binary security certification is claimed.

## Sync and history policy

History freezes the last saved report and its as-of date. Offline late marks are intentionally excluded. Perform resets on the primary computer after sync. Concurrent offline resets resolve deterministically but can discard each other's revisions. External editors or sync-conflict replacement can change vault files outside the plugin's control.

## Mobile compatibility regression (1.1.1)

Both new integration cases remove crypto.randomUUID and verify initialization, mark persistence, UUID v4 format/uniqueness within the fixture, and reset backups. All 43 Node/Python tests pass.

`tests/browser-smoke.cjs` passed in Chromium with mocked Obsidian APIs at 1600×1000 (mouse) and 393×851 (touch). It checks 60 calendars, six/one columns, no horizontal overflow, mobile 44px targets, three-state mark cycle, search and persistence across panel recreation. randomUUID is explicitly absent. This is not an Android app or real Sync test.

To reproduce the optional browser test, install Playwright in a separate tools directory (`npm install --prefix /tmp/habit-browser-tools playwright`), then run from the repository: `NODE_PATH=/tmp/habit-browser-tools/node_modules CHROME_PATH=/usr/bin/google-chrome node tests/browser-smoke.cjs`. Set CHROME_PATH to your installed Chromium/Chrome binary; SCREENSHOT_DIR optionally saves screenshots. No Playwright runtime dependency is shipped in the plugin.

## Publication preparation, 21 October 2026

The maintainer reports version 1.1.1 working on Ubuntu laptop and Android phones. Exact device/app versions remain unrecorded. This statement does not certify every acceptance test, Sync behaviour or the 1.7.2 minimum.

The publication package preserves the 1.1.1 runtime. Its source documentation, generic examples, source inventory/checksums and PowerPoint tutorial are new or updated. Nothing has been uploaded, made public, released or submitted by preparing the package. Hosted review and GitHub Actions on the user's repository have not run here.

Compatibility clarification: Ubuntu **24.04.3**. The user assumes the latest Obsidian version on each platform and latest Android; exact app/Android versions and phone models were not recorded. This is an assumption, not a verified numerical version.

Publication checks rerun on 21 October 2026: official lint and manifest/license checks, production build, 37 JavaScript tests, six Python tests, release consistency and packaging all passed. Commands were executed directly using the bundled Node runtime because npm was unavailable in the session. Runtime release bytes match the previously prepared 1.1.1 assets.

Reproducibility: a clean copy of the prepared upload source rebuilt all six delivered release files byte-for-byte. Personal CSV/list data is absent from the public package.
