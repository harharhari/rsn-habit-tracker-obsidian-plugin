# Additional questions and final design — 1.1.5

These questions are resolved using prior user choices or stated defaults so implementation can proceed. Exact platform results and GitHub account eligibility still need recording.

| Question | Answer/default | Design |
|---|---|---|
| Keep plain JavaScript or use TypeScript? | TypeScript for verifiable safety | Strict checks and all reported unsafe rules enabled |
| Is CommonJS still needed? | Yes, for the generated Obsidian bundle | ESM in source; CommonJS only in build output |
| May the tracker enumerate unrelated vault folders? | No | Traverse known Habit Tracker folders only |
| How should corrupt saved data be handled? | Fail without rewriting it | Validate unknown data before use; show restore guidance |
| Should historical records migrate or reset? | No | Preserve existing compatible formats and frozen snapshots |
| Should optional files stay on the Community release? | No, follow the review recommendation | Exactly three supported release attachments |
| How will the color file reach new users? | Embed the starter in main.js, as before | Create vault copy only when missing; preserve customized copy |
| Who creates attestations? | GitHub Actions | Attest the exact bytes used for the draft release |
| Should the workflow publish automatically? | No | Create a draft; maintainer tests then publishes |
| Is the repository still private? | Check before attesting | Free/Pro/Team require public repository; private needs Enterprise Cloud |
| Should mobile installation/sync change? | Retain prior preference | Manual desktop/Android; Sync first on iOS; separate Mac-assisted iCloud route |
| Should personal habits be bundled? | User: generic only | Private list and records excluded |
| Does prior Ubuntu/Android success certify this release? | No | Record exact current versions; all native acceptance remains a test task |

Combined final design: a portable typed plugin under the same ID/name, using validated vault records and scoped discovery while retaining the existing UI, daily mark cycle, explicit reset confirmation and frozen-history behavior. CI tests three desktop operating systems; GitHub builds and attests the exact tag before preparing a three-asset draft. Optional local installation material, source checksums, a platform tutorial and draw.io diagram accompany the upload kit. Final publication follows downloaded-byte testing and hosted review.
