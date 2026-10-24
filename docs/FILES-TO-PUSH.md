# Exact repository upload inventory: 1.1.6

Upload these 71 files to the repository root, preserving relative paths and hidden files. Upload repository/ CONTENTS, not the enclosing folder.

Keep Git history, old tags/releases and unrelated files. Delete obsolete src/core.js and src/plugin-source.js if still present. Do not upload generated main.js, node_modules, release-assets or manual-downloads as source folders.

```text
.gitattributes
.github/workflows/ci.yml
.github/workflows/release.yml
.gitignore
LICENSE
NOTICE
README.md
SHA256SUMS
docs/ANDROID-TEST-REPORT.md
docs/ANDROID-rsn-test-vault.md
docs/CHECKSUMS.md
docs/CI-TROUBLESHOOTING.md
docs/DATA-MODEL.md
docs/DEPLOYMENT-UPDATE-GUIDE.md
docs/DESIGN-DECISIONS.md
docs/FILES-TO-PUSH.md
docs/GITHUB-AND-COMMUNITY-RELEASE.md
docs/INSTALL-DOWNLOAD.md
docs/MIGRATION-1.1.3.md
docs/PLATFORM-TESTING.md
docs/RELEASE-ASSET-SHA256SUMS
docs/RELEASE-NOTES-1.0.1.md
docs/RELEASE-NOTES-1.1.0.md
docs/RELEASE-NOTES-1.1.1.md
docs/RELEASE-NOTES-1.1.2.md
docs/RELEASE-NOTES-1.1.3.md
docs/RELEASE-NOTES-1.1.4.md
docs/RELEASE-NOTES-1.1.5.md
docs/RELEASE-NOTES-1.1.6.md
docs/REVIEW-RESPONSE-1.1.5.md
docs/SETUP-AND-USAGE.md
docs/TEST-RESULTS-TEMPLATE.md
docs/TESTING-CHECKLIST.md
docs/TUTORIAL.md
docs/VALIDATION.md
docs/architecture.drawio
docs/images/browser-desktop.png
docs/images/browser-mobile.png
docs/images/editor-desktop.png
docs/images/editor-mobile.png
docs/navigation.drawio
docs/rsn-habit-calendar-one-b-tutorial.pptx
eslint.config.mjs
examples/habit-tracker-list-60.md
examples/habit-tracker-list.md
hex-color-list.md
manifest.json
package-lock.json
package.json
scripts/build.mjs
scripts/check-lockfile.mjs
scripts/check-release-tag.mjs
scripts/check-release.mjs
scripts/install.py
scripts/lint-metadata.mjs
scripts/monthly_helper.py
scripts/package-release.mjs
scripts/source-checksums.py
scripts/systemd_units.py
scripts/test-vault.mjs
src/core.ts
src/plugin.ts
styles.css
tests/browser-smoke.cjs
tests/build-metadata.test.mjs
tests/core.test.js
tests/plugin.test.js
tests/test_helper.py
tests/test_install.py
tsconfig.json
versions.json
```

For release 1.1.6, use the provided attestation workflow to attach only main.js, manifest.json and styles.css. The local release-assets directory contains matching preview files. The optional manual kit stays separate. See DEPLOYMENT-UPDATE-GUIDE.md.
