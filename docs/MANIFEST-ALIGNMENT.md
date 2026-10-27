# Manifest and attachment alignment: 1.1.10

Follow [RELEASE-RECOVERY.md](RELEASE-RECOVERY.md) for the complete deployment sequence and diagnosis of the 1.1.9 failure.

The default-branch manifest, selected tag's manifest and attached manifest must match in every field. The tag must be the exact x.y.z version. Version 1.1.10 also compares main.js, manifest.json and styles.css byte-for-byte by SHA-256 against the tagged build. A valid manifest alone cannot identify a stale bundle or stylesheet.

Run npm ci --ignore-scripts and npm run check before remote checks. The exact community-release directory must contain three fresh matching assets. With GitHub CLI authenticated to the correct repository, maintainer commands are:

```sh
export GITHUB_REPOSITORY=harharhari/rsn-habit-tracker-obsidian-plugin
export RELEASE_TAG=1.1.10
node scripts/remote-release.mjs preflight
node scripts/remote-release.mjs audit
```

Use PowerShell $env:GITHUB_REPOSITORY and $env:RELEASE_TAG on Windows. Preflight is read-only and checks readiness for a new/matching draft; it intentionally refuses a published release. Audit is read-only and requires publication. Run these from the matching tag checkout after building. The workflow performs those steps automatically. remote-release.mjs prepare mutates drafts and is intended for the attested workflow, after attestation; it never publishes.

The older check-manifest-alignment.mjs command remains available for comparing already-downloaded manifest files. It does not fetch files, verify bundle/CSS bytes, or replace the new audit.

The official [Obsidian submission guide](https://docs.obsidian.md/plugins/releasing/submit-plugin) says the directory reads the default branch and installs assets from the matching version tag. Maintain alignment during review; an audit is a point-in-time check, not a guarantee against later edits.
