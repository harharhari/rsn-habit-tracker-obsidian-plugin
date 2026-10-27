# Keep the repository and release manifests aligned

## Deploy version 1.1.9

1. Back up the vault. Upload the CONTENTS of repository/ into the existing GitHub repository root, preserving .github/workflows and subdirectories. Do not nest repository/ itself. Keep Git history and older tags/releases. FILES-TO-PUSH.md lists the source files.
2. Commit on the default branch. Open its root manifest.json on GitHub and confirm id rsn-habit-calendar-one-b, name rsn habit calendar one b, and version 1.1.9. Confirm package.json and versions.json were uploaded too. Do not change the published default-branch version to a future development version while requesting review.
3. From a clean source checkout, use Node 22+ and Python 3.12. Run npm ci --ignore-scripts, npm run check, then npm run test:helper. The check command runs lint, production compilation, automated tests, metadata/CSS guards and packaging. Run optional npm run test:browser with Playwright and a Chromium executable configured as described in PLATFORM-TESTING.md. Browser mocks do not replace device tests.
4. In GitHub Actions, wait for Build and review on that exact commit: Ubuntu, Windows and macOS must all pass. Test the three built files in rsn-test-vault on the target platforms, including the actual explorer/theme and sync. Record exact app/OS versions; “latest” is not a test record.
5. Create tag 1.1.9 on the passing commit, without a v prefix. In Actions > Prepare attested release > Run workflow, select the default branch and enter 1.1.9. The workflow checks out that tag and runs verification. It compares the current default-branch manifest with the tagged and built manifests before creating the draft.
6. The workflow creates a draft with exactly main.js, manifest.json and styles.css as individual attachments. It then downloads the attached manifest and compares again. Do not replace these attested files with local preview copies. If the final check fails, the draft may still exist: inspect it and fix the source/version mismatch before publication. Do not blindly rerun release creation against an existing draft.
7. Download all three draft attachments and test them together. Close Obsidian before replacement. Use <vault>/.obsidian/plugins/rsn-habit-calendar-one-b/. Preserve data.json and all Habit Tracker files. Reopen, enable the plugin, and confirm version 1.1.9.
8. Publish the tested draft. Run Actions > Audit published manifest > Run workflow, with tag 1.1.9. It also normally runs on release publication; manually dispatch it if no automatic run appears. It reads the live default branch and downloads the actual release manifest. A green Build and review alone does not prove remote release alignment.
9. Confirm the repository is publicly accessible for Community review. Return to the existing Community entry and review again, explaining both fixes in REVIEW-RESPONSE-1.1.9.md. Resolve new feedback before claiming acceptance. Do not submit a duplicate plugin.

## Diagnose an alignment failure

Read the failing check: it names the default branch, tag checkout or release asset. Check the repository default branch, not an arbitrary feature branch. Check the attachment named manifest.json, not GitHub's automatically generated source ZIP. All three versions must be 1.1.9 and all metadata must match. Use the same tagged build for all three assets. Keep existing published tags immutable; for another code fix, increment the version and publish a new release. Avoid changing the default branch between the checks and Community review. An audit for an older release will intentionally fail once the default branch advertises a newer version.

Optional local check after downloading the live manifests to separate files:

```sh
node scripts/check-manifest-alignment.mjs /path/to/default-manifest.json /path/to/downloaded-release-manifest.json 1.1.9
```

Run this from the matching tag checkout. It does not fetch files itself; the workflow performs the authenticated downloads.

## Official instructions

Obsidian reads the manifest at HEAD of the default branch and installs from the release whose tag matches its version. The repository needs README.md, LICENSE and manifest.json; the release needs main.js, manifest.json and this plugin's styles.css as separate attachments. For initial submission, sign into the Community directory with an Obsidian account and link GitHub. Existing submissions receive a new version and release when addressing feedback.

Sources checked 27 October 2026: [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin), [Manifest](https://docs.obsidian.md/Reference/Manifest), [Community directory](https://community.obsidian.md).
