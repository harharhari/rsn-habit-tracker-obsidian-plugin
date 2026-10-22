# Checksums

There are two SHA256SUMS files in this delivery with different scopes.

## Repository source snapshot

From the prepared repository root run `sha256sum -c SHA256SUMS`. It covers every shipped source/document/tutorial file except itself. It does not verify release downloads. When deliberately editing the repository, regenerate it before preparing a new source snapshot:

```bash
python3 scripts/source-checksums.py
```

This script uses the explicit inventory from the previous SHA256SUMS, so untracked vaults or build outputs are not accidentally included. Add new source paths explicitly to the script invocation, for example `python3 scripts/source-checksums.py docs/new-guide.md`. Deleted tracked entries are removed. Inspect the checksum diff before committing.

## GitHub Release downloads

Download the release's SHA256SUMS alongside all five files it names. Run `sha256sum -c SHA256SUMS` from that download directory. All five entries must say OK. `npm run check` or `npm run release:assets` regenerates release/SHA256SUMS automatically.

The checksum file cannot contain its own hash. ZIP and loose-file hashes must belong to the same version. SHA-256 checks detect corruption/mismatch, not publisher identity. Keep the repository snapshot checksum out of the release attachments; attach the release checksum instead.
