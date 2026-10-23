# Validation — rsn habit calendar one b 1.1.3

Prepared 23 October 2026. No remote upload, release or submission performed.

## Executed locally

- Official Obsidian ESLint recommended/API-aware rules and official manifest/license checks passed.
- Added explicit current manifest-ID syntax checks: lowercase letters/hyphens only, no forbidden suffix or word. Release checks also require the exact requested ID and display name.
- Production build and release consistency checks passed, including mobile manifest and runtime import restrictions.
- 39 JavaScript tests passed (11 core and 28 mocked-vault integration).
- 11 Python tests passed: six helper tests plus five installer/migration tests. Total: **50 tests**.
- Four invalid-ID fixtures were checked: the old numeric ID, uppercase letters, a plugin suffix and an obsidian-containing ID all fail local validation.
- Four Chromium scenarios passed for 1.1.3: wide desktop, narrow pane, phone and tablet. These use mocked Obsidian APIs.
- Installer tests cover the new folder, opt-in settings migration, preservation of existing destination settings, invalid legacy JSON and unchanged history.

Commands underlying npm run check ran directly using the bundled Node runtime. The pinned official lint release did not catch digits in the old ID, so hosted-document rules are now enforced explicitly. Local checks cannot establish name/ID uniqueness or hosted acceptance.

## Compatibility boundary

The UI/data engine is retained from 1.1.2, whose Chromium and Linux WebKit tests passed eight scenarios. Those are historical browser-engine results using mocked APIs, not native device certification. 1.1.3 native tests, real sync, minimum Obsidian 1.7.2 and hosted CI/review remain pending. Follow PLATFORM-TESTING.md and MIGRATION-1.1.3.md with actual downloaded release bytes. Record exact OS/app versions rather than “latest”.

Personal lists and vault records are excluded. The public package contains generic examples. No fresh dependency-security audit is claimed.

## Final package verification

A clean copy of the prepared source rebuilt all six release files byte-for-byte. The public source includes generic examples only. The editable tutorial has 40 slides. Source and release checksums are separate and must be used in their respective directories.
