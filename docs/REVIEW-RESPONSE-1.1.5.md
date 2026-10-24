# Community review response — 1.1.5

| Finding | Change | Evidence / remaining action |
|---|---|---|
| Missing artifact attestations | Added manually dispatched Prepare attested release workflow. It reruns three-OS CI, builds the exact tag, attests three supported assets and creates a draft containing those bytes. | Attestations only exist after a successful GitHub run. Local files are not described as attested. |
| Extra unsupported release files | Community release contains only main.js, manifest.json, styles.css. Optional manual kit and color reference stay separate. | Do not attach the six-file manual kit or handoff ZIP to the Community release. |
| Vault enumeration | Replaced every getFiles call with TFolder.children traversal confined to Habit Tracker subfolders. | Regression forbids getFiles and rejects reads of unrelated notes. Event subscriptions still receive paths but immediately filter tracker paths. Obsidian plugins are not sandboxed permissions boundaries. |
| Unsafe argument / call / member access / assignment / return | Migrated src/core.js and src/plugin-source.js to strict src/core.ts and src/plugin.ts; model and UI types are explicit. JSON and plugin settings enter as unknown and are validated before use. | All five reported rules are errors in local lint; no any, suppression or unchecked JSON cast was added. |
| require imports in source | Authored source uses ESM imports. Production TypeScript compilation emits the CommonJS format Obsidian loads. | no-require-imports is enabled for source. Generated main.js requires only obsidian. |

The new validation also checks nested report totals, frozen calendar state and archive schema before rendering. Malformed retained data raises an error and is left untouched for restoration; it is not silently reset. Schema-1 archive markers and schema-2/3 snapshots remain supported. The habit IDs, timezone, record format and plugin identity are unchanged.

Delete obsolete src/core.js and src/plugin-source.js from the GitHub branch when uploading the new TypeScript files. Leaving them behind can cause the scanner to report the old findings again. The root file inventory is authoritative. A generated main.js belongs in release assets, not in src/.

Hosted scanning may use different rules or versions. Passing local checks does not guarantee the next hosted result; request a new review after publishing 1.1.5. See VALIDATION.md for actual execution boundaries.
