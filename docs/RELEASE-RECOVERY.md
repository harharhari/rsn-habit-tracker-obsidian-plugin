# Recover from the 1.1.9 release failures

The reported error means that the manifest attached to release 1.1.9 contains version 1.1.7. A release title/tag is a label; it does not rewrite uploaded files. Re-running Audit published manifest against the same files should fail again. Ubuntu, Windows and macOS build success does not prove that manually attached assets came from that build.

## Recommended recovery: a fresh 1.1.10 release

1. Keep the existing repository, history, published releases and tags. Do not delete everything and do not move the published 1.1.9 tag.
2. Upload the CONTENTS of this package's repository/ directory to the repository root, including hidden .github/workflows files. Replace matching source files; preserve unrelated content. Delete obsolete src/core.js and src/plugin-source.js only if old copies remain alongside the TypeScript replacements. Do not commit the outer release-assets/ or manual-downloads/ folders.
3. Commit to the default branch (currently master). On GitHub open root manifest.json and confirm version 1.1.10 and ID rsn-habit-calendar-one-b. Confirm package.json, package-lock.json, versions.json, scripts and all three workflows are included. Do not upload a manifest from an older download folder.
4. Run Build and review on the new commit. Wait for all three OS jobs to pass. Test the build in rsn-test-vault. Record actual Obsidian and OS versions on each available device.
5. Create the tag 1.1.10 on that exact passing commit, without a v prefix. Use a local git tag/push or GitHub's tag creation interface. If using Draft a new release to create the tag, leave it a draft and do not attach files or publish; the preparation workflow can fill an empty draft. Never select an old tag and merely change its title to 1.1.10.
6. In Actions > Prepare attested release > Run workflow, select the updated default branch and enter 1.1.10. The workflow checks out the tag, rebuilds/tests it, validates staging/default branch, checks an existing draft if any, attests the built assets and creates/resumes the draft. It downloads all three attachments by asset ID and compares their hashes with the tagged build. Read the job summary.
7. In Releases, open the 1.1.10 draft produced by this workflow. Its assets must be main.js, manifest.json and styles.css only. GitHub's automatic Source code archives are separate and normal. Do not add the optional kit or replace the workflow's attachments.
8. Download all three assets into an empty local directory. Open manifest.json and verify 1.1.10. Verify checksums against docs/RELEASE-ASSET-SHA256SUMS from tag 1.1.10, then test these downloaded files together. Do not use a browser-renamed file such as manifest (1).json or files cached in an older download folder.
9. Publish the tested draft. Run Actions > Audit published manifest manually with tag 1.1.10 if an automatic run is absent. It installs/builds the tagged source and checks all three actual published attachments plus the current default branch. It is read-only. Wait for success before requesting Community review.
10. Return to the existing Obsidian Community entry and request/check review again. Explain the stale-asset diagnosis and 1.1.10 verification changes. Keep the default-branch manifest at 1.1.10 during that review; develop the next version on a separate branch.

## Safe retries and failure messages

| Situation | Meaning and next step |
|---|---|
| No draft exists | Preparation creates one and uploads exactly three files. |
| Matching draft is complete | Re-running preparation verifies it without replacing attachments. |
| Matching draft is incomplete | Re-running uploads only missing files, then verifies everything. |
| Existing draft contains wrong bytes/version | Preparation stops before changing it. Inspect the draft. Prefer a new version/tag; any manual removal of known-wrong draft assets must be deliberate. The workflow never deletes or clobbers. |
| Release is already published | Preparation refuses to change it. Audit that version; corrections require a new version/tag. |
| Audit says release missing or still draft | Finish preparation/testing/publication first. Check token access if the release exists but is invisible. |
| Default branch version differs | Verify the real default branch and the selected tag. Commit the intended version; do not disable the check. Auditing an old version against a newer default branch intentionally fails. |
| HTTP 401/403 or repository access error | Check Actions policy, token permissions and repository access. A failed API request is never interpreted as permission to create a new release. |
| Attestation permission/availability error | Review repository visibility, GitHub plan and configured id-token/attestations permissions. Do not skip the failing attestation step and describe the files as attested. |
| Asset digest/content mismatch | Use the summary's asset ID and expected/actual hashes. Stop publication; do not substitute files merely to make a version number look right. |

The workflow concurrency group serializes its own preparation runs for a tag. Avoid simultaneous manual edits to that release/default branch. GitHub operations are not a single atomic transaction; a failed upload can leave an incomplete draft that a subsequent matching run can resume. A later manual edit can invalidate an earlier successful audit.

## Sharing useful error details

Open Actions > failed run > failed job > first red step. Copy the step name and lines immediately before the exit code, including expected/actual version or hashes. Also copy the run URL and selected tag. Do not include tokens. The job Summary now includes verification results and the specific failure message.

## Optional manual upload

The recommended route is the attested workflow. If manually creating a release, attach exactly the three files from release-assets/ for this same version, verify its manifest and checksums, and run the published audit. Local preview files are not described as attested merely because their checksums match. Do not attach the whole upload ZIP as a substitute for the runtime files. The optional manual-downloads/ kit belongs in Actions artifacts or a separate downloads repository, not the Community release.

## Sources

[Obsidian submission instructions](https://docs.obsidian.md/plugins/releasing/submit-plugin), [Manifest reference](https://docs.obsidian.md/Reference/Manifest), [GitHub release asset API](https://docs.github.com/en/rest/releases/assets), [GitHub artifact attestation guidance](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations). Checked 27 October 2026. Attestations on Free/Pro/Team require a public repository; private/internal repositories require Enterprise Cloud under the current documented policy.
