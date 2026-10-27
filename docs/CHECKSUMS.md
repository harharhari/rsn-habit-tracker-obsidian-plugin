# Checksums and provenance — 1.1.8

## Source snapshot

From repository/ run sha256sum -c SHA256SUMS (Mac: shasum -a 256 -c SHA256SUMS). It covers every delivered source/document file except itself. For intentional source changes run python3 scripts/source-checksums.py, supplying any new source paths as extra arguments. It uses an explicit previous inventory to avoid accidentally including private vaults or generated outputs.

## Three Community assets

The repository docs/RELEASE-ASSET-SHA256SUMS records hashes of the three locally prepared files. Download that file from the exact release tag, place it beside main.js, manifest.json and styles.css and run sha256sum -c RELEASE-ASSET-SHA256SUMS (Mac: shasum -a 256 -c RELEASE-ASSET-SHA256SUMS). The file stays in source documentation; do NOT attach it to the Community release.

For GitHub workflow builds, prefer gh attestation verify for each file with --repo harharhari/rsn-habit-tracker-obsidian-plugin, then inspect source commit/workflow. The workflow's three loose assets should match the recorded hashes. A mismatch requires investigation; do not replace signed assets with a local build merely to match a checksum.

## Optional manual kit

manual-downloads/SHA256SUMS covers its four loose files plus installation ZIP (five payloads), not itself. Verify from that folder with sha256sum -c SHA256SUMS or shasum -a 256 -c SHA256SUMS. Do not attach the kit to the Community release. npm run check regenerates this kit under release/.

On Windows PowerShell, replace the checksum filename below with RELEASE-ASSET-SHA256SUMS for the three-file verification, or leave SHA256SUMS for the manual kit/source snapshot:

```powershell
Get-Content .\SHA256SUMS | ForEach-Object {
    if ($_ -notmatch '^([0-9a-fA-F]{64})  (.+)$') { throw 'Invalid checksum line' }
    $expected = $Matches[1]
    $assetName = $Matches[2]
    $actual = (Get-FileHash -LiteralPath $assetName -Algorithm SHA256 -ErrorAction Stop).Hash
    if ($actual -ine $expected) { throw "Checksum mismatch: $assetName" }
    Write-Host "OK: $assetName"
}
```

The adjacent upload-to-github-008.zip.sha256 verifies the complete handoff ZIP. Hashes detect corruption or mismatched files; they are not digital signatures or proof of safety. No checksum includes itself. Real provenance is produced by GitHub, not by the local package generator.
