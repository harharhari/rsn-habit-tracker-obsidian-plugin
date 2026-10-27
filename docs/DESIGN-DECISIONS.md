# 1.1.10 questions, answers and final design

The error details supplied by the user establish a stale release attachment, so no UI redesign is needed. The following implementation answers preserve previously confirmed preferences.

1. Should the manifest guard be removed to make the workflow green? No; it correctly rejected 1.1.7 content under tag 1.1.9.
2. Is checking only manifest.version enough? No; verify all manifest fields and SHA-256 of all three downloaded assets against the tagged build.
3. Should a retry delete/recreate an existing release? No. Resume only matching drafts, upload only missing assets, and never clobber or auto-publish.
4. Should published releases be repaired silently? No. Preserve history and use new version/tag 1.1.10 for this correction.
5. What should happen if a draft contains stale files? Stop before mutation with the file/version/hash diagnosis. The maintainer decides how to handle the conflicting draft.
6. Should an API authorization/network error mean no release exists? No. Propagate the error; release listing must succeed before absence is inferred.
7. Which branch should users upload to? The repository's real default branch, currently master. Create the version tag on the tested commit.
8. Should preparation publish automatically? No; keep a draft so downloaded files can be tested first.
9. Should calendars, toolbar, Details, hiding or data change? No. Preserve all confirmed 1.1.9 behavior, identity and user data; retain no-:has/no-!important CSS checks.
10. Are native devices and hosted workflows already verified? No. Local tests include mocked release operations and browser APIs. Run hosted 1.1.10 workflows and record exact native platform versions.

Combined design: strengthen release staging, lifecycle handling, diagnostics and download verification while retaining the working portable runtime. One tested tag produces one matching three-file release; generic examples remain public and private habit lists stay excluded. Existing draw.io navigation remains applicable.
