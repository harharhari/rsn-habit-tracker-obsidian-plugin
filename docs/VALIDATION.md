# Version 1.1.6 validation

Prepared 24 October 2026. No GitHub upload, workflow dispatch, attestation or Community submission was performed.

## Executed locally

- Production build and strict TypeScript checking passed on Linux with Node 24.22.1. Obsidian ESLint checks passed with zero warnings, including enabled unsafe-code checks.
- 51 JavaScript tests passed: 15 core, 33 mocked-vault integration and three build-preflight tests.
- 11 Python helper/installer tests passed. Total: 62 automated tests.
- Four Chromium browser scenarios passed: wide desktop, narrow desktop pane, phone and tablet. Each checked 60 calendars, responsive layout, marking, search, persistence and month selection, plus Y/N choices, named-color selection, custom hex input, rejection of invalid colors, saving and the Details folder list. Obsidian APIs were mocked.
- Existing history tests verify that previous calendars and statistics stay frozen. New tests verify stale editor saves cannot overwrite synced changes and malformed colors cannot be saved.
- The 46-slide editable tutorial was exported, rendered and checked. Native PowerPoint and native mobile Obsidian execution were not performed.

## Limits and pending checks

GitHub Ubuntu/Windows/macOS jobs, the attestation workflow, hosted Obsidian Community review, native Obsidian acceptance on all six target platforms, real device sync and minimum-version 1.7.2 testing remain pending. Record exact OS and Obsidian versions in TEST-RESULTS-TEMPLATE.md. Chromium viewport emulation is not native Android/iOS testing. No WebKit/Safari result is claimed for this version.

See TESTING-CHECKLIST.md and GITHUB-AND-COMMUNITY-RELEASE.md for the remaining tests and release steps. Previous user-reported Ubuntu/Android results are historical and are not certification of 1.1.6.

## Clean installation and reproducibility

A fresh npm ci --ignore-scripts installation from the public registry succeeded with the final lockfile (309 packages). The same source then passed npm run check with its own installed dependencies. All three Community files and all six optional kit files rebuilt byte-for-byte. The ESLint 9 deprecation warning remains nonfatal. npm reported no known vulnerabilities at installation time; this is not a security certification.
