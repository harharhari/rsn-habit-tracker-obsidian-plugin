# 1.1.3 questions, answers and combined design

## Confirmed requirements

User-selected ID: rsn-habit-calendar-one-b. Exact name: rsn habit calendar one b. Version 1.1.3. Same repository, author harharhari and GPL-3.0-only. Preserve all-platform targets, one column on phones/tablets, optional Obsidian Sync first on iOS, Mac-assisted iCloud alternative, generic public examples and draw.io diagrams.

## Additional questions resolved by existing requirements or safe defaults

| Question | Answer / stated default | Design consequence |
|---|---|---|
| Was the old ID published or only rejected? | Assume rejected, as reported | Retry initial submission; if already published, contact directory support |
| Rename the Habit Tracker data folder too? | No | History and existing notes retain their paths |
| Rewrite existing monthly code blocks? | No | Keep habit-calendar renderer registration |
| Change saved workspace view type? | No | Retain internal view key for compatibility; this is not the manifest ID |
| Transfer remembered decisions? | Yes, copy old data.json before activation | Explicit manual migration or opt-in installer flag |
| Overwrite settings already created under the new ID? | No automatic overwrite | User chooses after backing up both files |
| Run old and new identities together? | No | Disable old plugin on every device before activation |
| Transfer hotkeys automatically? | No | Reassign shortcuts through Obsidian settings |
| Rename Linux timer files? | Yes for new installs | Stop old timer before enabling replacement |
| Reuse tag 1.1.2? | No | Publish new exact tag 1.1.3 with fresh checksums |
| Is name/ID availability guaranteed? | No | Hosted directory remains authoritative |
| Does latest OS mean device tested? | No | Record numerical versions and real test outcomes separately |

These defaults allow implementation without another blocking question. They can be revised if the prior ID was actually published or an installation uses a custom configuration folder.

## Combined final design

Use one portable plugin bundle under the new manifest identity. Preserve tracking formats and the internal view/code-block keys to keep existing data usable. Validate the current manifest restrictions explicitly. Install into a matching new folder, preserve settings through an explicit non-overwriting copy, and never activate both identities. Deliver six release assets, updated source checksums, all-platform installation/migration instructions, an editable tutorial and exact GitHub upload inventory. Device and hosted acceptance remain separate from automated tests.
