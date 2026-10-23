# Exact repository upload inventory — 1.1.2

Upload all 54 files below, preserving relative paths, to the root of harharhari/rsn-habit-tracker-obsidian-plugin. Include hidden .github, .gitignore and .gitattributes. README.md, LICENSE and manifest.json belong at the root.

```text
.gitattributes
.github/workflows/ci.yml
.gitignore
LICENSE
NOTICE
README.md
SHA256SUMS
docs/ANDROID-TEST-REPORT.md
docs/ANDROID-rsn-test-vault.md
docs/CHECKSUMS.md
docs/DATA-MODEL.md
docs/DESIGN-DECISIONS.md
docs/FILES-TO-PUSH.md
docs/GITHUB-AND-COMMUNITY-RELEASE.md
docs/Habit-Calendar-001b-Tutorial.pptx
docs/INSTALL-DOWNLOAD.md
docs/PLATFORM-TESTING.md
docs/RELEASE-NOTES-1.0.1.md
docs/RELEASE-NOTES-1.1.0.md
docs/RELEASE-NOTES-1.1.1.md
docs/RELEASE-NOTES-1.1.2.md
docs/SETUP-AND-USAGE.md
docs/TEST-RESULTS-TEMPLATE.md
docs/TESTING-CHECKLIST.md
docs/TUTORIAL.md
docs/VALIDATION.md
docs/architecture.drawio
docs/images/browser-desktop.png
docs/images/browser-mobile.png
eslint.config.mjs
examples/habit-tracker-list-60.md
examples/habit-tracker-list.md
hex-color-list.md
manifest.json
package-lock.json
package.json
scripts/build.mjs
scripts/check-release.mjs
scripts/install.py
scripts/lint-metadata.mjs
scripts/monthly_helper.py
scripts/package-release.mjs
scripts/source-checksums.py
scripts/systemd_units.py
scripts/test-vault.mjs
src/core.js
src/plugin-source.js
styles.css
tests/browser-smoke.cjs
tests/core.test.js
tests/plugin.test.js
tests/test_helper.py
tsconfig.json
versions.json
```

The outer release-assets directory is separate: upload its six files individually as GitHub Release attachments for tag 1.1.2. Do not commit node_modules, generated main.js/release directories, personal lists, vaults or data.json. Keep older release tags intact. Source SHA256SUMS describes this snapshot; regenerate it deliberately after edits.
