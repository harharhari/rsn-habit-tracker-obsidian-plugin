# GitHub testing and Community publication — Habit Calendar 001b 1.1.1

Public author: **harharhari**. Repository: **harharhari/rsn-habit-tracker-obsidian-plugin**.
License: **GPL-3.0-only**. Plugin ID: **habit-calendar-001b**.

## A. Put the source in your private repository

Clone your existing private repository using GitHub Desktop, SSH, or authenticated Git:

```bash
git clone https://github.com/harharhari/rsn-habit-tracker-obsidian-plugin.git
cd rsn-habit-tracker-obsidian-plugin
```

Copy the prepared source folder CONTENTS into this clone. README.md and manifest.json must be at the repository root, not under another nested folder. Include hidden `.github/` and `.gitignore`.

Commit these items (the precise generated inventory is in docs/FILES-TO-PUSH.md):

- Root README.md, LICENSE, NOTICE, manifest.json, versions.json, package.json, package-lock.json, eslint.config.mjs, tsconfig.json, styles.css, hex-color-list.md, .gitignore.
- src/, scripts/, tests/, examples/, docs/, and .github/workflows/ci.yml.

Do not commit node_modules/, generated main.js, release/, Python caches, personal vault data, or archive downloads. The .gitignore handles build outputs. Previous 1.0.1 archives can remain outside this source checkout for rollback reference.

## B. Build and run review checks

Install Node.js 22+ with npm. Python 3.9+ is only needed for helper tests/utilities. Open a terminal in the source repository:

```bash
node --version
npm --version
npm ci --ignore-scripts
npm run build
npm run lint
npm test
npm run test:helper
npm run check
```

For routine release preparation, `npm run release:assets` runs the full Node check/build/package sequence. `npm run check` already includes lint, production build, JavaScript tests, metadata/asset checks, packaging, and checksums; the separate commands above show how to diagnose a failure. Run helper tests separately as CI does.

What each check means:

| Command | Purpose |
|---|---|
| npm ci --ignore-scripts | Install exact lockfile dependencies without dependency lifecycle scripts |
| npm run build | Produce desktop/mobile CommonJS main.js; embed the color reference; stage four loose release files |
| npm run lint | Official eslint-plugin-obsidianmd recommended and API-aware rules, plus explicit official manifest/license validators; warnings fail |
| npm test | Portable logic and mocked-vault regression tests, including reset and frozen-history behaviour |
| npm run test:helper | Python helper's idempotence, timezone boundary, preservation, and no-reset checks |
| npm run check | All Node checks plus deterministic ZIP and SHA256SUMS |

The official hosted directory review runs separately AFTER submission. Local ESLint is not a hosted approval, malware audit, or real-device acceptance test. UI, mobile, and your sync workflow remain your tests.

Push the reviewed source:

```bash
git add .gitignore .github README.md LICENSE NOTICE manifest.json versions.json package.json package-lock.json eslint.config.mjs tsconfig.json styles.css hex-color-list.md src scripts tests examples docs SHA256SUMS
git diff --cached --stat
git status --short
git commit -m "Prepare Habit Calendar 001b 1.1.1"
git push
```

On GitHub open Actions → Build and review. Check that the job succeeds. Download its artifact if desired; it contains the release directory. The workflow only builds/tests and uploads an artifact; it does not create GitHub releases automatically.

## C. Create a private test release

1. On the repository's GitHub page open Releases → Draft a new release.
2. Create tag `1.1.1` against the tested commit; do not prefix it with `v`.
3. Use title `Habit Calendar 001b 1.1.1` and copy docs/RELEASE-NOTES-1.1.1.md into its description.
4. Attach these six files from release/ **individually**:

```text
main.js
manifest.json
styles.css
hex-color-list.md
habit-calendar-001b-1.1.1.zip
SHA256SUMS
```

5. Keep the repository private during testing. You may mark the release as a pre-release while testing. Publish the private test release so authorized repository users can download it.
6. Download all six attachments into a fresh folder, verify checksums, and follow SETUP-AND-USAGE.md. Test these downloaded bytes, not just a working-directory build.
7. Record device/Obsidian versions and results in TESTING-CHECKLIST.md. If code changes after publishing the test release, increment the version consistently and release a new tag with freshly built assets.

An unzipped FOLDER is not a release asset. main.js, manifest.json, and styles.css must be separate attachments for the Obsidian installer. The ZIP is optional convenience; hex-color-list.md and SHA256SUMS are extra assets. The color starter is bundled inside main.js, so standard Community installs need no extra download step.

SHA256SUMS covers the four loose files and installation ZIP, not itself. The installation ZIP contains the four files plus LICENSE and NOTICE. It deliberately does not contain its own checksum file. The source ZIP is separate and is not one of the six installation assets.

## D. Official submission — current process checked 21 October 2026

Official reference: https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin

After successful testing:

1. Make the source repository public. Ensure README.md, LICENSE, and manifest.json are committed on its default branch.
2. Publish a normal GitHub release whose tag exactly matches the manifest version. Attach main.js, manifest.json, and styles.css separately.
3. Sign in at https://community.obsidian.md with your Obsidian account and link your GitHub account.
4. Go to Plugins → New plugin, enter the repository URL, select the owner and submit the form. It reads the default-branch manifest and verifies repository ownership. The ID must be unique and must not contain `obsidian`.
5. Review the automated feedback. Fix issues, increment the version, commit, and publish another matching release as needed.
6. Complete Publish in the directory. Installability depends on resolving review errors and directory approval.

This is the current official directory-based process, replacing the older community-plugins.json pull-request instructions. Re-check the linked official page immediately before submission, since policies can change. No submission, public visibility change, or upload has been performed by preparing these files.

## E. Exact upload workflow for this delivery

The outer delivery folder has `repository/` and `release-assets/`. Commit the CONTENTS of `repository/` to your GitHub repository root. The outer START-HERE.md and FILE-LOCATIONS.md are local handoff instructions; you need not commit them. Upload the six files inside `release-assets/` as six separate release attachments. The two checksum files have different scopes; see CHECKSUMS.md.

For the web interface: open your private repository, select Add file → Upload files, and drag the repository contents into the page. Enable hidden-file display to include `.github/` and `.gitignore`. Preserve subdirectories. Confirm README.md and manifest.json appear at the root. If hidden folders or the presentation exceed browser upload constraints, use the Git method below. Do not upload the outer handoff ZIP as a substitute for source files.

For Git: clone your repository into a separate folder. Copy the prepared repository contents into that clone, including hidden files, without replacing its `.git/`. Review existing files rather than deleting unrelated work. Run `git status --short`, `git diff --stat`, then stage the supplied files, commit and push. Use `git branch --show-current` to identify your actual default branch rather than assuming its name.

`package.json` has `private: true` to prevent accidental npm publication. This does not control GitHub repository visibility and does not block Obsidian use.

Do not silently replace an already published 1.1.1 binary with different code. This preparation keeps the working runtime bytes. Documentation-only changes can be committed separately. If binary changes become necessary after testing, increment manifest/package/lockfile/versions metadata and create a new matching release.

## F. Official testing methods and our acceptance gate

Obsidian recommends a separate development vault. Install the downloaded release into **rsn-test-vault**, enable it under Community plugins and restart after manifest changes. The app build/reload procedure is documented in [Build a plugin](https://docs.obsidian.md/Plugins/Getting%20started/Build%20a%20plugin). Our full checklist is TESTING-CHECKLIST.md and results form is TEST-RESULTS-TEMPLATE.md.

1. Verify release checksums, then run the install/basic-use checklist on Ubuntu and Android. Confirm marks survive restart and the displayed plugin version is 1.1.1.
2. Use the generic 60-habit example in a disposable vault to test scrolling, filtering, desktop six-column layout and Android one-column touch use. Check default light and dark themes, portrait/landscape and narrow desktop panes.
3. Exercise Yes and No on list edits. Confirm Yes clears ALL current marks and No preserves displayed data. Verify custom color rows survive restart and an upgrade.
4. Execute the synthetic history fixture in the checklist. Confirm late marks cannot change either historical calendars or statistics. Test offline/current-month merge with your actual sync service.
5. Check the app console for errors while loading, changing months, marking and disabling/re-enabling the plugin. A blank screen without an error report is not an acceptance result.
6. Desktop mobile emulation: in Developer Tools → Console run `this.app.emulateMobile(true)` and later `this.app.emulateMobile(false)`. This checks the mobile interface but does not replace a phone test.
7. Android debugging: enable USB debugging, connect by USB and inspect the Obsidian WebView using Chrome at `chrome://inspect/`. See [official mobile development instructions](https://docs.obsidian.md/Plugins/Getting%20started/Mobile%20development). Capture only the relevant error text.
8. Record exact OS/app versions. Verify the declared minimum Obsidian 1.7.2 on a test environment, or revise the minimum to a verified supported version before a new release. API linting alone does not establish a tested compatibility floor.

The maintainer reports Ubuntu/Android working, but minimum-version, all-checklist and real Sync evidence is still pending. Windows/macOS/iOS testing is optional unless you advertise them as tested. The earlier Android emulator could not boot, so its result remains blocked despite browser and user-phone evidence.

## G. Hosted review and acceptance

Current official sources checked 21 October 2026:

- [Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin): root README/LICENSE/manifest, exact version tag and separate release assets. After submission fix review errors through a new version/release. Publish does not bypass unresolved errors.
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim): sign in, link GitHub, then Plugins → New plugin. Enter repository URL and owner, accept the developer policies and maintenance commitment, and submit.
- [Manage your plugin](https://docs.obsidian.md/community-directory/manage-entry): inspect Manifest, Releases, Source code and Build verification results. Use Review branch → Run preview scan to evaluate an accessible branch/commit, and Request review or Check for new releases when necessary.
- [Directory FAQ](https://docs.obsidian.md/community-directory/faq): the scanner looks for build, then build:plugin, then compile. Our npm run build is the production command. The official ESLint plugin provides local review checks.
- [Submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins): correct minimum app version, concise description and platform-safe APIs. The plugin uses Web Crypto and vault APIs, with isDesktopOnly false. Build scripts use Node only during development.
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies): review the current licensing, transparency and prohibited-behaviour requirements before agreeing. GPL-3.0-only and attribution are included here.

The source repository is intended to become public after testing. Verify GitHub recognizes its GPL license. A separate private-source arrangement exists in the official directory, but this package uses the user's planned public-source repository.

On your entry page, review listing text, select the appropriate category/payment designation for this free plugin, and publish when ready. No payment is needed to use the tracker; external Obsidian Sync remains optional. After errors clear and listing publication completes, test installation from the Community browser into a new vault. That final test verifies discoverability and the actual three-asset download path.

## H. Future releases

Run the checks, update version metadata consistently and publish an exact matching x.y.z tag with fresh assets. Initial submission is a one-time step; subsequent releases trigger directory checks. Monitor review feedback and GitHub issues. If unable to maintain the plugin, follow the directory's transfer/archive process. A signed build provenance attestation is a recommended future enhancement; this manual release package does not claim one. See [official GitHub Actions release guide](https://docs.obsidian.md/Plugins/Releasing/Release%20your%20plugin%20with%20GitHub%20Actions).
