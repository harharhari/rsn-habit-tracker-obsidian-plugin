# Version 1.1.10 validation

Prepared 27 October 2026. No remote upload, GitHub workflow dispatch, attestation or Community submission was performed. Public 1.1.9 run/release metadata was inspected read-only; evidence is in REVIEW-RESPONSE-1.1.10.md.

## Executed locally

- Strict TypeScript checking, Obsidian ESLint checks with zero warnings, production build, metadata/license validation and release packaging passed on Linux.
- 73 JavaScript tests passed: 15 core, 34 mocked-vault integration, three preflight tests, five manifest alignment tests and 16 release lifecycle/asset verification tests. 11 Python helper/installer tests passed. Total: 84 automated tests.
- Four Chromium scenarios passed: wide desktop, narrow pane, phone and tablet. Each checked 60 calendars, layout, mark cycle, search, rerender persistence, month picker, habit editor and Details. Assertions check the exact four main buttons, moved management buttons, displayed-month routing for Statistics and Back to calendars, exact-path explorer hiding, unrelated-path visibility and visibility restoration when CSS is removed.
- The sidebar tests use representative Obsidian explorer markup and mocked APIs. They are not native Obsidian or device tests. The direct title/sibling CSS replaces :has without observers. Tests also cover expanded children with inline display:block and height:200px, inserted rows, renamed paths and zero-height hidden entries. The CSS depends on current file-explorer DOM; a changed theme/app structure may leave entries visible without altering data.
- A fresh public-registry npm ci --ignore-scripts installation succeeded using the final lockfile. Dependency entries match 1.1.9; only the plugin root version changed. The ESLint 9 deprecation warning remains nonfatal. npm reported no known vulnerabilities at installation time; that is not a security certification.
- The release check rejects :has selectors and !important declarations in the distributed stylesheet. The 16 new tests mock GitHub CLI responses, including stale 1.1.7 manifests, stale CSS/bundles, matching/incomplete/conflicting drafts, published-release protection and API failures. All three workflow YAML files parsed successfully. Hosted 1.1.10 execution remains pending. The 47-slide editable tutorial was rendered and structurally validated. Native PowerPoint execution was not performed.

Checks used Linux, Node 24.22.1 and Python 3.12. GitHub uses Node 22/Python 3.12 on its Ubuntu, Windows and macOS runners.

## Pending acceptance

Run native Obsidian tests on Windows 11, Ubuntu, macOS, Android, iPhone and iPad, including the actual file explorer/theme, workspace restoration, real sync and plugin disable/re-enable. Record exact OS/app/theme versions in TEST-RESULTS-TEMPLATE.md. Minimum Obsidian 1.7.2 acceptance, WebKit/Safari, GitHub three-OS CI, the attestation workflow and hosted Community review remain pending.

See TESTING-CHECKLIST.md, PLATFORM-TESTING.md and GITHUB-AND-COMMUNITY-RELEASE.md. Historical success reports for older versions do not certify 1.1.10. Hiding is visual only; preserve the complete Habit Tracker folder in backups and sync.

## Reproducibility and handoff

The freshly installed source passed npm run check with exit status zero. All three Community assets and all six optional kit files match that build byte-for-byte. Source, release preview, manual kit and full ZIP checksums were regenerated and verified. The ZIP contains the upload tree without node_modules or generated source-root bundles.
