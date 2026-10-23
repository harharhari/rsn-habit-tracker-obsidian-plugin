# Validation — rsn habit calendar one b 1.1.4

Prepared 24 October 2026. No remote upload, release or submission was performed.

## Executed for this release

- Clean public-registry npm ci --ignore-scripts succeeded using a fresh empty npm cache: 309 packages installed. Corrected which-typed-array version: 1.1.24. The unavailable 1.1.34 archive is not referenced by the lockfile.
- npm run check passed: dependency preflight, official Obsidian ESLint recommended/API rules and manifest/license checks, production build, automated JavaScript tests, version/asset checks and release packaging.
- **42 JavaScript tests passed**: 11 core, 28 mocked-vault integration and three new lockfile preflight regressions.
- **11 Python tests passed**: six helper tests and five installer/migration tests. Total: **53 tests**.
- Tests cover current-month confirmations/reset, historical calendar/report freezing after late sync, mobile UUID fallback, portable month selection, Windows CRLF/BOM/Unicode lists and preservation during settings migration.
- The installation reported zero known vulnerabilities at that time; this is not a security certification. The ESLint 9.39.5 deprecation warning remains nonfatal.

Linux verification used Node 24 (the successful unrestricted check reported 24.22.1), npm 11.19.0 and Python 3.12. The GitHub matrix selects Node 22 and Python 3.12. It must run on the new uploaded commit. Source preflight prints the actual environment and lockfile digest for comparison.

## Pending or historical evidence

Native Windows and macOS CI jobs were not executed in this local Linux environment. Ubuntu/Windows/macOS hosted results remain pending after upload. Native Obsidian device tests on all target platforms, real synchronization, minimum Obsidian 1.7.2 and hosted Community review remain pending.

The UI/data engine is unchanged from 1.1.3. Prior Chromium layout scenarios and earlier Linux WebKit results are historical mocked-API browser evidence, not new 1.1.4 native-device tests. The user reported 1.1.1 functioning on Ubuntu and Android; that does not certify this new release or the other platforms. The earlier Android emulator was unable to boot.

Use PLATFORM-TESTING.md and TEST-RESULTS-TEMPLATE.md to record exact OS/app versions and downloaded-release outcomes. Local lint does not establish directory name/ID availability or acceptance. Generic examples only; no private habit data is included.

## Final package verification

The prepared source was rebuilt and its six release files checked against the delivered attachments. The public source includes generic examples only. The editable tutorial has 40 slides. Source and release checksums are separate and must be used in their respective directories.
