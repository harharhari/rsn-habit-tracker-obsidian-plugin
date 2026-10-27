# Release failure diagnosis and response: 1.1.10

## Evidence

The user supplied the failed step output: release attachment version must match 1.1.9; actual 1.1.7. The guard correctly failed.

Read-only GitHub inspection on 27 October 2026 found:

- [Prepare attested release run 40483985107](https://github.com/harharhari/rsn-habit-tracker-obsidian-plugin/actions/runs/40483985107): all three verify/build jobs succeeded; the release job failed at Verify manifest downloaded from the draft release.
- [Audit run 40483867307](https://github.com/harharhari/rsn-habit-tracker-obsidian-plugin/actions/runs/40483867307): failed at Download the actual GitHub manifests and compare.
- Public release metadata for tags 1.1.9 and 1.1.7 reports the same manifest digest, 4d7721598097bb983a08836ad4d01285224426f332cd419ace0e43932d3e95ef, and the same stylesheet digest, 3bae32ca1c5b83f5e9f3035ca6177dd1ac24037b650b4acca72cd96dcbb66adf. The stale attachments include more than the manifest. This establishes a distribution mismatch; it does not establish who attached the files or exactly when.

## Resolution

Do not weaken or skip the mismatch check. Publish a fresh 1.1.10 release from the tested 1.1.10 tag. Verify all three files against the tagged build, report clear errors and allow safe draft retries. Preserve published 1.1.9 and older tags; do not silently replace them or attempt to fix them by renaming their release.

The plugin runtime/UI stays unchanged. The stylesheet still contains neither :has nor !important. Local regression tests include the reported stale 1.1.7 manifest case and stale CSS/bundle files. See VALIDATION.md for executed checks and RELEASE-RECOVERY.md for recovery steps.

Nothing was uploaded, deleted, published or re-run remotely by this preparation task. The new release must be deployed and pass hosted review before acceptance is claimed.
