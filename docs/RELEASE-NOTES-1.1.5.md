# rsn habit calendar one b 1.1.5

Addresses the Community review findings with strict TypeScript source, explicit validation of stored data, ESM source imports, and file discovery confined to Habit Tracker. Current-month resets, daily marking, frozen historical calendars/statistics and existing data formats remain compatible.

The release process now generates provenance attestations in GitHub Actions and attaches only main.js, manifest.json and styles.css to the Community release. The color reference is embedded in the plugin and appears in the vault automatically; no fourth download is needed. Optional manual ZIP and checksums remain in the handoff/test kit, separate from the Community release.

Upgrading from 1.1.3/1.1.4: preserve data.json and the complete Habit Tracker folder, replace the three program files in .obsidian/plugins/rsn-habit-calendar-one-b/, restart and confirm 1.1.5. Older habit-calendar-001b installations must follow the identity migration guide.

See REVIEW-RESPONSE-1.1.5.md and VALIDATION.md. Native device tests, hosted review and attestation generation must be completed on the uploaded version before acceptance is claimed.
