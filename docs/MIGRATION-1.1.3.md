# Moving from Habit Calendar 001b to rsn habit calendar one b

Version 1.1.3 changes the plugin identity, not your tracking data format.

| Item | Old 1.1.1 / 1.1.2 | New 1.1.3 |
|---|---|---|
| Plugin ID and installation folder | habit-calendar-001b | rsn-habit-calendar-one-b |
| Display name | Habit Calendar 001b | rsn habit calendar one b |
| Vault data | Habit Tracker | Habit Tracker (unchanged) |
| Monthly code block | habit-calendar | habit-calendar (unchanged) |

The previous ID contains digits, which the current [official manifest rules](https://docs.obsidian.md/Reference/Manifest) prohibit. The folder name must match the new manifest ID. Obsidian treats this as a different plugin, so ordinary in-place updating of the old installation is insufficient.

## Manual migration on Windows, Ubuntu, Mac or accessible Android storage

1. Finish syncing and back up the entire vault, including hidden .obsidian and Habit Tracker folders. Test on a copy named rsn-test-vault first.
2. In Settings → Community plugins, disable **Habit Calendar 001b** on EVERY device that uses this vault. Also keep the older Habit Calendar 001 disabled. Close Obsidian on the devices being changed. Do not run the two identities together: they share records and view registrations.
3. Download and verify the 1.1.3 release. Create `<vault>/.obsidian/plugins/rsn-habit-calendar-one-b/`. Copy main.js, manifest.json, styles.css and hex-color-list.md there, or use the supplied installation ZIP.
4. If `<vault>/.obsidian/plugins/habit-calendar-001b/data.json` exists, copy it into the NEW folder before enabling the new plugin. It holds remembered decisions. Preserve the original as a backup. If the new folder already has data.json, back up both and deliberately choose which settings to keep; do not blindly overwrite newer settings. If no old data.json exists, skip this step.
5. Leave the entire Habit Tracker folder in place. Do not replace its habit list, customized hex-color-list.md, Records, Statistics, Months or System. No record conversion, renaming or habit-list reset is needed for this release.
6. Reopen the correct vault. Enable **rsn habit calendar one b**, verify version 1.1.3 and run its **Open current month** command. Keep Habit Calendar 001b disabled.
7. Compare existing marks, current statistics, historical snapshots and custom colors with the backup. A pending habit-list edit may still prompt; choose No until you deliberately want to reset the current month.
8. Reassign hotkeys and command shortcuts to the new plugin commands. Their full command IDs now begin `rsn-habit-calendar-one-b:`. Existing monthly Markdown notes retain their habit-calendar code block. If an old tab does not reopen, close it and use Open current month.
9. Once every device passes, keep the old plugin folder disabled or move it to a backup OUTSIDE .obsidian/plugins. Do not uninstall the old plugin before saving any wanted data.json. Never remove Habit Tracker as part of plugin cleanup.

A custom Obsidian configuration directory replaces .obsidian in all paths. Use the same custom directory across the relevant migration steps.

## iPhone/iPad through Obsidian Sync

Perform the initial migration on the primary desktop while other devices are idle and the old plugin is disabled. Sync the installed/active community plugin lists and, to transfer data.json, community plugin settings. Configure these preferences on each device. Wait for complete transfer, reopen Obsidian, verify the old plugin remains off and the new plugin shows 1.1.3. Then verify marks/history before resuming edits. Repeat on each phone/tablet. A matching vault name alone does not prove connection to the same remote vault.

If settings sync is not enabled, the calendar records can still sync through Habit Tracker, but remembered per-plugin decisions will not transfer. Never approve an unexpected reset simply to complete migration. [Official Sync settings](https://help.obsidian.md/sync/settings).

## iPhone/iPad through a Mac-managed iCloud vault

Use Finder on the Mac to perform the same folder and data.json copy in the shared iCloud vault. Let files finish transferring before reopening Obsidian on iPhone/iPad. Disable the old identity and enable the new one on each device. Keep iCloud and Obsidian Sync as separate alternatives, never simultaneous sync layers for the same vault. The iOS Files app does not provide the same hidden-folder access as Finder.

## Optional developer installer

After npm run build, close Obsidian and disable the old plugin first:

```bash
python3 scripts/install.py --vault "/path/to/rsn-test-vault" --migrate-from-001b
```

The installer reads the new ID from release/manifest.json. The explicit flag copies old data.json only when it exists and the new destination has none. It validates old JSON before writing, preserves the old copy and backs up an existing destination. It does not toggle plugins, change hotkeys, or edit Habit Tracker. Without the flag it performs a normal installation without importing legacy settings.

## Optional Linux timer

If using the optional systemd helper, disable the old timer before enabling the renamed one:

```bash
systemctl --user disable --now habit-calendar-001b.timer
```

Generate/install the new rsn-habit-calendar-one-b.service and .timer using SETUP-AND-USAGE.md. Keep only one timer active against a vault. No timer is required for normal plugin use.

## Rollback

Disable the new plugin everywhere before re-enabling the old one. Preserve both settings files and vault backups. The record format is unchanged, but any deliberate edits or resets made after migration remain real data changes; switching binaries does not undo them. Restore a backup only when that is the intended recovery action.
