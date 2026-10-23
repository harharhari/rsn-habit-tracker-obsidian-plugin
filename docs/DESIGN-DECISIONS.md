# 1.1.4 design questions and final design

The following answers combine existing user decisions with explicit implementation defaults. None requires a destructive data migration.

| Additional question | Answer/default | Result |
|---|---|---|
| Does the npm error require calendar redesign? | No; all logs identify the same dependency | Repair build inputs, preserve runtime behavior |
| Which dependency should be resolved? | Use registry-backed lockfile, currently which-typed-array 1.1.24 | Reproducible integrity-checked installation |
| How can an old upload be detected? | Preflight prints commit and lockfile digest | Reject stale metadata before npm ci |
| Which OS should run helper tests? | All three desktop CI runners | Windows gets timezone data |
| Should lint jump to another major immediately? | No; keep tested compatible rules for this repair | Nonfatal deprecation disclosed |
| Should existing plugin ID change again? | No | Same folder and settings for 1.1.3 upgrades |
| Does the previous old-ID migration still matter? | Yes, for 1.1.1/1.1.2 users | Retain historical migration guide |
| Should release publishing be automatic? | No; user tests downloaded files first | CI uploads artifacts only |
| Include personal habit list? | User: generic examples only | Private list and vault data excluded |
| Which iOS setup should be prioritized? | User: Sync first; manual/iCloud alternative | Existing platform tutorial retained |
| How many tablet calendars per row? | User: one | Phone/tablet behavior unchanged |
| Can latest OS versions count as tested? | No; record exact versions on actual devices | Pending results remain explicit |

Final design: one portable plugin bundle for Windows, Ubuntu, macOS, Android, iPhone and iPad, with the existing vault data model, frozen historical calendars/reports and confirmed current-month resets. This patch changes build validation, version metadata and documentation. Deliver six installation/release assets, a source inventory and checksums, an editable tutorial and the existing draw.io architecture. Commit repaired sources together, obtain all three CI results, test downloaded assets in rsn-test-vault, then publish the matching release and complete hosted review. No new schedules or personal-data inclusion is introduced.
