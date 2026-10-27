# Version 1.1.7 validation

Prepared 26 October 2026. No remote upload, GitHub workflow dispatch, attestation or Community submission was performed.

## Executed locally

- Strict TypeScript checking, Obsidian ESLint checks with zero warnings, production build, metadata/license validation and release packaging passed on Linux.
- 52 JavaScript tests passed: 15 core, 34 mocked-vault integration and three preflight tests. 11 Python helper/installer tests passed. Total: 63 automated tests.
- Four Chromium scenarios passed: wide desktop, narrow pane, phone and tablet. Each checked 60 calendars, layout, mark cycle, search, rerender persistence, month picker, habit editor and Details. New assertions check the exact four main buttons, moved management buttons, displayed-month routing for Statistics and Back to calendars, exact-path explorer hiding, unrelated-path visibility and visibility restoration when CSS is removed.
- The sidebar tests use representative Obsidian explorer markup and mocked APIs. They are not native Obsidian or device tests. The CSS depends on current file-explorer DOM; a changed theme/app structure may leave entries visible without altering data.
- A fresh public-registry npm ci --ignore-scripts installation succeeded using the final lockfile. Dependency entries match 1.1.6; only the plugin root version changed. The ESLint 9 deprecation warning remains nonfatal. npm reported no known vulnerabilities at installation time; that is not a security certification.
- The 47-slide editable tutorial was rendered and structurally validated. Native PowerPoint execution was not performed.

Checks used Linux, Node 24.22.1 and Python 3.12. GitHub uses Node 22/Python 3.12 on its Ubuntu, Windows and macOS runners.

## Pending acceptance

Run native Obsidian tests on Windows 11, Ubuntu, macOS, Android, iPhone and iPad, including the actual file explorer/theme, workspace restoration, real sync and plugin disable/re-enable. Record exact OS/app/theme versions in TEST-RESULTS-TEMPLATE.md. Minimum Obsidian 1.7.2 acceptance, WebKit/Safari, GitHub three-OS CI, the attestation workflow and hosted Community review remain pending.

See TESTING-CHECKLIST.md, PLATFORM-TESTING.md and GITHUB-AND-COMMUNITY-RELEASE.md. Historical success reports for older versions do not certify 1.1.7. Hiding is visual only; preserve the complete Habit Tracker folder in backups and sync.

## Reproducibility and handoff

The independently installed clean source passed npm run check with exit status zero. All three Community assets and all six optional kit files rebuilt byte-for-byte. Source, release preview, manual kit and full ZIP checksums were regenerated and verified. The ZIP contains the upload tree without node_modules or generated source-root bundles.
