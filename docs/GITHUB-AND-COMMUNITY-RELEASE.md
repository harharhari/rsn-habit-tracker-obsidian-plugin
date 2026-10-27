# GitHub testing, attestations and Community publication — 1.1.10

For recovery from the reported stale 1.1.9 attachments, start with [RELEASE-RECOVERY.md](RELEASE-RECOVERY.md).

For repository cleanup, manual-kit distribution and existing-release handling, follow [the deployment update guide](DEPLOYMENT-UPDATE-GUIDE.md). Do not delete the whole repository or upload the outer handoff directories as source.

Author harharhari; GPL-3.0-only; repository harharhari/rsn-habit-tracker-obsidian-plugin; ID rsn-habit-calendar-one-b; name rsn habit calendar one b.

## 1. Upload the complete source

Extract upload-to-github-010.zip. Copy the CONTENTS of repository/ to your repository root, preserving hidden .github, .gitignore and .gitattributes. README.md, LICENSE and manifest.json must be at the root. FILES-TO-PUSH.md lists every file. Do not upload the outer ZIP as a substitute for source.

IMPORTANT when updating the old GitHub tree: DELETE obsolete src/core.js and src/plugin-source.js. Their replacements are src/core.ts and src/plugin.ts. Otherwise the scanner can still review the old unsafe JavaScript. Do not delete Habit Tracker, data.json or unrelated repository work. Do not commit node_modules, build/, main.js, release/ or community-release/ generated outputs.

With Git, copy the source into a clone, review git status and the diff, stage the supplied changes and the two explicit obsolete-file removals, then commit and push. In the GitHub web UI use Add file → Upload files, preserve directories and include hidden files; separately delete those two obsolete files. Check that package.json, package-lock.json and manifest.json all say 1.1.10 and that .github/workflows/release.yml is present.

## 2. Local build and review checks

Use Node.js 22+ with npm. Python 3.9+ is needed only for helper tests; CI uses 3.12. Windows helper tests need python -m pip install tzdata. Ubuntu systems with only python3 may run python3 -m unittest discover -s tests -p 'test_*.py' -v instead of the npm helper command.

```text
node scripts/check-lockfile.mjs
npm ci --ignore-scripts --registry=https://registry.npmjs.org
npm run typecheck
npm run lint
npm run build
npm test
npm run test:helper
npm run check
```

For routine use, npm run check already combines the Node checks and packaging; separate commands above are for diagnosis. TypeScript strict checking and all five reported no-unsafe rules are enabled, together with no-require-imports and no-explicit-any. Production source uses ESM; generated main.js uses CommonJS for Obsidian. JSON is treated as unknown until validated. npm run build is the discoverable production command.

Outputs: community-release/ has exactly three supported assets. release/ is the optional six-file local test kit, including ZIP and checksums. Build/review CI runs on Ubuntu, Windows and macOS and uploads test kits. These runners do not launch native Obsidian.

## 3. Review downloaded-byte acceptance

Use rsn-test-vault and the full PLATFORM-TESTING.md / TESTING-CHECKLIST.md. Record results in TEST-RESULTS-TEMPLATE.md. Test Windows 11, Ubuntu 24.04.3, current macOS, Android, iPhone and iPad with exact OS/Obsidian versions.

- Fresh install, plugin enable, empty list, generic examples, 60 calendars, scroll/search, wide desktop six columns and mobile/tablet one column.
- None → green → pink → none, prior current-month dates, future-day lock, restart persistence and statistics.
- Habit changes: No preserves displayed data; Yes intentionally clears all current-month marks. Historical calendars and totals remain frozen after late synced records.
- Upgrade from 1.1.4 preserves settings/history/colors. Test old-ID migration separately if needed. Validate custom colors and malformed metadata using only disposable fixtures.
- Offline edits, actual Sync and month rollover. Keep a backup and avoid mixing iCloud and Obsidian Sync for one vault.
- Check console errors and the declared minimum Obsidian 1.7.2 before claiming minimum-version support.

Obsidian recommends a separate [development vault](https://docs.obsidian.md/Plugins/Getting%20started/Build%20a%20plugin). [Mobile development](https://docs.obsidian.md/Plugins/Getting%20started/Mobile%20development) covers desktop emulateMobile(true/false), Android Chrome USB inspection and Apple Web Inspector. These aids do not replace actual-device tests. Existing local evidence is in VALIDATION.md.

## 4. Prepare GitHub Actions and a version tag

In GitHub Settings → Actions → General, ensure actions are allowed by repository/organization policy. The workflows use official actions/checkout, setup-node, setup-python and upload-artifact v7; attest@v4 is used for provenance. CI has contents: read. Only the manually dispatched release job requests contents: write, id-token: write and attestations: write.

Wait for Build and review on your new commit to pass on all three OSs. Do not rerun the old commit containing the old source/lockfile. Review the source and test it before signing a release.

Create tag 1.1.10 on that reviewed commit. Do NOT create a release manually yet; the workflow creates its draft. For Git:

```text
git tag 1.1.10 <reviewed-commit-sha>
git push origin 1.1.10
```

Replace the placeholder with the actual reviewed commit. If the tag already exists, verify it points to that commit. Do not move or overwrite published tags. A matching existing draft can be resumed: the workflow uploads only missing files. Conflicting drafts and already published releases are rejected; it never clobbers attachments. Use a new version if previously published bytes must change.

## 5. Generate real attestations and the draft release

GitHub Free/Pro/Team support attestations for PUBLIC repositories. Private/internal repositories need Enterprise Cloud. Keep the repository private for preliminary testing if desired; make the intended public repository public when ready for signing/submission. If your account cannot attest a private repository, do not bypass the signing step or describe local assets as attested. See [GitHub eligibility and instructions](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations).

1. Ensure the workflow files are committed on the default branch.
2. Open Actions → Prepare attested release → Run workflow.
3. Use the reviewed default-branch workflow and enter tag 1.1.10.
4. The workflow reruns the Ubuntu/Windows/macOS checks for that ref. Its release job then checks out the tag, verifies tag/manifest equality, rebuilds it and attests main.js, manifest.json and styles.css.
5. Preflight checks the default branch, exact staging files and existing release. After successful attestation it creates or resumes a matching DRAFT, uploads only missing files, then downloads all three by asset ID and verifies SHA-256 against the tagged build. It does not publish automatically. Check the job summary and repository attestations.
6. Download the three attachments from the draft into a fresh folder. Authorized repository users can access drafts. Verify provenance, then perform installation/upgrade acceptance on those actual downloaded files.
7. Edit the draft description if necessary; leave the verified files unchanged. Publish the normal release when tests pass. Run Audit published manifest with tag 1.1.10 and require success; it rebuilds that tag and checks all published attachments and the default branch. If code changes are needed, prepare another version/tag rather than replacing attested published binaries.

Optional verification on a computer with GitHub CLI and repository access:

```text
gh attestation verify main.js --repo harharhari/rsn-habit-tracker-obsidian-plugin
gh attestation verify manifest.json --repo harharhari/rsn-habit-tracker-obsidian-plugin
gh attestation verify styles.css --repo harharhari/rsn-habit-tracker-obsidian-plugin
```

Inspect the verification result's source repository, workflow and source commit; compare with the intended tag. Provenance establishes build origin, not absence of bugs or malware. Do not upload locally rebuilt files over the workflow's assets. Download the workflow's optional test kit separately if wanted; it is not a Community release attachment.

## 6. Release attachments and unsupported extras

The Community release should have ONLY:

```text
main.js
manifest.json
styles.css
```

The automatic GitHub Source code ZIP/tar.gz links are normal. Do not manually attach hex-color-list.md, the installation ZIP, SHA256SUMS, the tutorial or the outer upload ZIP. The color starter is already embedded in main.js and is created in Habit Tracker only when missing. This addresses the unsupported-extras recommendation without removing user features.

Source and checksum documentation remain in the repository. The outer handoff has release-assets/ with three LOCAL preview files, and manual-downloads/ with the optional six-file kit. Those local preview files have no attestation until corresponding bytes are built and signed on GitHub; use the workflow-generated draft for the final release.

## 7. Complete the Obsidian review

Official instructions checked 27 October 2026:

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin): root README/LICENSE/manifest, exact version tag and separate supported release assets; fix findings through an incremented release.
- [Directory FAQ](https://docs.obsidian.md/community-directory/faq): production command search order build, build:plugin, compile; initial submission only once, later releases are updates.
- [Manifest](https://docs.obsidian.md/Reference/Manifest): keep the existing accepted ID/name and correct mobile/version fields.
- [Manage entry](https://docs.obsidian.md/community-directory/manage-entry): use the directory's review/status controls for the existing listing.

For an existing draft/submission, return to that entry, check for the new release/request review as available, and examine Manifest, Releases, Source code and Build verification results. Do not create a duplicate listing. If already accepted, publish the new matching GitHub release and monitor the update review. If this is still an initial submission, sign in at community.obsidian.md, link GitHub, use the existing submission or Plugins → New plugin as appropriate, resolve errors and publish the listing.

After acceptance, install through Settings → Community plugins → Browse in a fresh vault on desktop and mobile. Confirm the real three-file installer creates the color reference and the plugin starts correctly. Local lint, a workflow pass or a recommendation fix alone does not certify acceptance. REVIEW-RESPONSE-1.1.10.md records the stale-asset evidence and changes; REVIEW-RESPONSE-1.1.5.md preserves earlier review history.

