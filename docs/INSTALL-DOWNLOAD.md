# Install and upgrade 1.1.5 on all target platforms

For repository cleanup, manual-kit distribution and existing-release handling, follow [the deployment update guide](DEPLOYMENT-UPDATE-GUIDE.md). Do not delete the whole repository or upload the outer handoff directories as source.

Plugin: rsn habit calendar one b. Author: harharhari. Use rsn-test-vault for the first installation. The same built files target every platform through Obsidian APIs; there is no Windows EXE, macOS installer or separate phone build. Normal use needs neither Node.js nor Python.

## 1. Download the three plugin files

Open https://github.com/harharhari/rsn-habit-tracker-obsidian-plugin/releases/tag/1.1.5 after publication. Download main.js, manifest.json and styles.css from Assets. Draft/private downloads require authorized repository access. The Community release deliberately has only these three files. GitHub's automatic Source code archives require a developer build.

The optional six-file manual-downloads kit is included in the maintainer handoff and CI artifacts, not attached to the Community release. It contains an installation ZIP, color starter and SHA256SUMS as conveniences. Neither ZIP nor color download is required: main.js embeds the starter.

## 2. Verify downloads

For a workflow-signed release, verify each of the three files using GitHub CLI:

```text
gh attestation verify main.js --repo harharhari/rsn-habit-tracker-obsidian-plugin
gh attestation verify manifest.json --repo harharhari/rsn-habit-tracker-obsidian-plugin
gh attestation verify styles.css --repo harharhari/rsn-habit-tracker-obsidian-plugin
```

Check source commit/workflow against the intended tag. Before the first signing run, local handoff files have checksums only, not attestations. The repository docs/RELEASE-ASSET-SHA256SUMS records the prepared three-file hashes; compare with the exact version/tag, not a newer branch.

For the optional manual kit only, verify its five payloads using SHA256SUMS: Ubuntu sha256sum -c SHA256SUMS; Mac shasum -a 256 -c SHA256SUMS. On Windows use the PowerShell loop in CHECKSUMS.md. A hash detects changed bytes but does not prove origin. Stop on a mismatch and obtain matching files. Preserve filenames without .txt suffixes.

## 3. Windows 11 laptop

1. Install Obsidian from its official download page. Create/open rsn-test-vault and note its actual location, for example Documents\Obsidian\rsn-test-vault.
2. Close Obsidian. In File Explorer enable View → Show → Hidden items and File name extensions. Open the vault's .obsidian directory and create plugins if missing.
3. Create rsn-habit-calendar-one-b inside .obsidian\plugins and copy the three downloaded files into it. The result must be .obsidian\plugins\rsn-habit-calendar-one-b\main.js, without a second nested plugin folder.
4. Reopen the vault. Settings → Community plugins → Turn on community plugins. Enable rsn habit calendar one b and verify 1.1.5.
5. Press Ctrl+P and run rsn habit calendar one b: Open current month.

Do not rename main.js to main.js.txt. The runtime uses vault-relative paths; you do not enter a Windows drive path in the habit table.

## 4. Ubuntu laptop

1. Open rsn-test-vault once and close Obsidian.
2. In Files press Ctrl+H to show hidden files. Open the vault's .obsidian/plugins folder, creating plugins if needed.
3. Create rsn-habit-calendar-one-b there and copy main.js, manifest.json and styles.css into that folder.
4. Reopen Obsidian, enable community plugins and rsn habit calendar one b. Verify 1.1.5.
5. Press Ctrl+P and run Open current month.

## 5. MacBook or other Mac

1. Install Obsidian from its official download page. Open/create rsn-test-vault and quit Obsidian.
2. In Finder open the vault folder and press Command+Shift+Period to reveal hidden files. Open .obsidian/plugins, creating plugins if necessary.
3. Create rsn-habit-calendar-one-b inside plugins and copy the three downloaded files into it. Check that main.js sits directly inside that plugin folder.
4. Reopen Obsidian, enable community plugins and rsn habit calendar one b, and verify 1.1.5.
5. Press Command+P and run Open current month.

For a vault intended for Obsidian Sync, choose a local folder outside iCloud/other sync roots. The separate iCloud route below uses iCloud alone for that vault.

## 6. Android manual installation

1. Install the official Obsidian app and create/open rsn-test-vault using device storage. Record the actual vault location. App-private storage is not accessible through the ordinary file-manager workflow.
2. Open the vault once, then force-stop Obsidian. Transfer verified assets from a computer, or download the same release.
3. Enable Show hidden files in the file manager. Create .obsidian/plugins/rsn-habit-calendar-one-b inside the vault.
4. Copy main.js, manifest.json and styles.css directly inside it. If using the optional manual kit, you may instead copy its extracted plugin folder into plugins.
5. Reopen Obsidian, enable community plugins and rsn habit calendar one b, then run Open current month from the command palette. Expect one calendar per row.

[Official Android storage guidance](https://obsidian.md/help/android).

## 7. iPhone/iPad preferred route: Obsidian Sync

This route also works across Windows, Ubuntu, macOS and Android. It requires an Obsidian Sync subscription. The plugin itself requires no payment or account.

1. On a computer, install and test 1.1.5 in rsn-test-vault as above. Enable the Sync core plugin, sign in and connect to a dedicated remote test vault.
2. Under Settings → Sync, enable the installed community plugin list and active community plugin list. Enable community plugin settings if you want remembered decisions to sync. Do not exclude Habit Tracker or its Records, Statistics and System subfolders.
3. Wait for sync completion. On iPhone/iPad install Obsidian from the App Store. Use its Obsidian Sync setup flow to connect to the SAME remote test vault. The local name can be rsn-test-vault; names alone do not establish a connection.
4. Configure the required plugin-sync preferences on the iPhone/iPad too. These preferences are device-specific. Wait for download completion, then fully close and reopen Obsidian.
5. Enable community plugins and verify rsn habit calendar one b version 1.1.5. Open the command palette from the ribbon/menu and run Open current month.
6. Test marking and restart persistence. Repeat setup separately on the iPad. Both phones and tablets use one calendar per row, including landscape and Split View.

Keep this vault outside iCloud syncing. [Official Sync settings](https://help.obsidian.md/sync/settings).

## 8. Apple-only alternative: manual plugin copy through a Mac/iCloud vault

This avoids a Sync subscription but requires a Mac for the straightforward hidden-folder installation procedure. It is an alternative vault arrangement, not an extra sync layer on the same vault.

1. On iPhone/iPad, create a separate rsn-test-vault in Obsidian with Store in iCloud enabled. This creates it inside the app's iCloud Drive/Obsidian folder. Use a unique test name if a vault with that name already exists.
2. Let iCloud finish syncing. On the Mac, locate that same vault under iCloud Drive → Obsidian and open it in Obsidian once. Quit Obsidian on both devices before copying plugin files.
3. On the Mac use Command+Shift+Period to reveal .obsidian. Copy the three verified release files into .obsidian/plugins/rsn-habit-calendar-one-b. Preserve any data.json during an upgrade.
4. Allow iCloud to upload/download everything. Keep the vault downloaded using the available macOS Keep Downloaded option. Reopen the vault on the phone/tablet and enable community plugins and rsn habit calendar one b.
5. Verify version 1.1.5, then run Open current month. Confirm the downloaded files are fully available before diagnosing a missing plugin.

Do not assume the iOS Files app exposes .obsidian or provides the same hidden-file controls as Finder. If you lack a Mac and cannot access the configuration directory, use the Sync route for prerelease testing or Community installation after acceptance. There is no need to invent a phone-only hidden-folder copying procedure.

iCloud is an Apple-specific alternative here; it is not the recommended shared-vault solution for Ubuntu/Android. [Official sync-method guidance](https://help.obsidian.md/sync-notes).

## 9. After Community acceptance, on any platform

Open Settings → Community plugins → Browse. Search rsn habit calendar one b, check author harharhari, install and enable it. Obsidian downloads main.js, manifest.json and styles.css from the matching release. The starter color reference is embedded in main.js, so no separate color-file download is needed. This route installs the program, not your tracking history. Configure sync separately if desired.

## 10. First use and month selection

Run Open current month. A fresh vault starts with no enabled habits. Use Habit list and add the generic example rows in examples/habit-tracker-list.md. Save and choose Yes only for the intended replacement. This clears all current marks, including unchanged habits. Use No to retain the displayed month, or Apply habit list to retry later.

Tap/click a date to cycle unmarked, green, pink, unmarked. Earlier current-month dates work; future dates and previous months are locked. Choose month now uses a Month dropdown and a four-digit Year field (1970–9999). Select the month, enter the year and press Open; Enter also works in the year field.

Monthly Markdown notes render in Reading view or a rendered Live Preview block. Source mode shows the fenced code. The command opens the interactive view directly.

## 11. Upgrade from 1.1.1 or 1.1.2

The plugin ID changed in 1.1.3. For upgrades from 1.1.1/1.1.2 only: Follow [MIGRATION-1.1.3.md](MIGRATION-1.1.3.md), including disabling Habit Calendar 001b on all devices, installing in rsn-habit-calendar-one-b, copying wanted data.json and preserving the entire Habit Tracker folder. Do not overwrite the old folder with a mismatched manifest, and do not run both plugins together. Reassign command hotkeys. The guide covers desktop, Android, Sync and Mac-assisted iCloud.

## 12. Troubleshooting

Missing plugin: check the correct vault/configuration directory, folder nesting, exact extensions, complete download and restart. If using a custom config folder, substitute it for .obsidian everywhere.

Blank view: try the direct command and Reading view; record any notice/console error. Controls without calendars: verify Y rows and whether you declined a list change. Do not accept a destructive reset just to troubleshoot.

Different devices disagree: verify they connect to the same remote vault and wait for sync. Offline resets and late historical marks follow the documented revision/freeze rules. Preserve Statistics and System in backups.

## Upgrade from 1.1.3 or 1.1.4 to 1.1.5

The ID and folder are unchanged. Close Obsidian, back up the vault, and replace main.js, manifest.json and styles.css inside .obsidian/plugins/rsn-habit-calendar-one-b/. Replace the optional plugin-folder hex-color-list.md starter if desired; keep the customized vault copy. Preserve data.json and the entire Habit Tracker folder. Restart and enable the plugin, verify version 1.1.5 and existing marks. MIGRATION-1.1.3.md applies only when moving from the older habit-calendar-001b folder.
