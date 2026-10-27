# Version 1.1.10

Correct release preparation and recovery after the 1.1.9 release was found to contain a manifest declaring 1.1.7. Keep the strict mismatch check: changing a release tag does not update attached files.

The release workflow now validates the exact three-file staging directory, checks the current default-branch manifest, and downloads every existing/uploaded attachment by its asset ID. SHA-256 must match the fresh build from the selected tag. The manifest also has a readable expected/actual version diagnostic. GitHub-provided asset digests are checked when present.

Preparation can create a new draft or resume an incomplete matching draft, uploading only missing assets. It refuses conflicting assets and published releases; it never deletes files or uses --clobber. A concurrency group serializes preparations for the same tag. After upload all three files and the default branch are checked again. GitHub step summaries record asset IDs and hashes. Audit published manifest rebuilds the tag and verifies all three actual published attachments, not just the manifest.

No calendar, editor, data-schema or plugin identity changes. Keep the 1.1.9 CSS fix without :has or !important. Upgrade by replacing main.js, manifest.json and styles.css together; preserve data.json and the complete Habit Tracker folder. Native acceptance and hosted 1.1.10 workflows remain pending.
