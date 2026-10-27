# Response to Community review: 1.1.9

## Release manifest differs from repository manifest: version

All prepared manifests now contain version 1.1.9 and the same plugin metadata. The release workflow checks the current default branch against the tagged source and build output before attestation, then checks the actual downloaded draft attachment. A read-only Audit published manifest workflow checks the published attachment and current default branch. Five regression tests cover matching manifests, stale branch version, stale asset version, other metadata differences and an invalid v-prefixed tag.

The reported remote mismatch has not been inspected or repaired online in this task. Uploading these files alone does not replace an old release asset. Follow MANIFEST-ALIGNMENT.md and publish the matching 1.1.9 release. Checks validate a moment in time; later branch changes can cause a new mismatch.

## CSS lint: avoid !important

Version 1.1.9 removes both :has selectors and !important declarations from the distributed stylesheet. Exact-path title and following-child selectors use display:none plus visibility:hidden, max-height:0, overflow:hidden and zero spacing. The extra collapse properties handle expanded child containers with inline display:block without overriding that inline declaration. No observer, polling, file moves or data migration are introduced. Native app/theme acceptance remains required.

The release checker rejects both prohibited CSS patterns. Browser fixtures test inline display:block and height:200px, zero-height hidden entries, inserted rows, renamed paths, unrelated folders and restoration after stylesheet removal. These are mocked browser checks, not native Obsidian acceptance.

Return to the existing Community listing after publishing the corrected release. Do not create a duplicate plugin entry. See GITHUB-AND-COMMUNITY-RELEASE.md and VALIDATION.md.
