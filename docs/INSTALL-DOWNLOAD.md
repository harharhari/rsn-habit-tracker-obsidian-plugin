# Install and upgrade 1.1.2 on all target platforms

Plugin: Habit Calendar 001b. Author: harharhari. Use rsn-test-vault for the first installation. The same built files target every platform through Obsidian APIs; there is no Windows EXE, macOS installer or separate phone build. Normal use needs neither Node.js nor Python.

## 1. Download the release

Open https://github.com/harharhari/rsn-habit-tracker-obsidian-plugin/releases/tag/1.1.2 after the maintainer publishes it. Private repositories require authorized access. Download the six explicitly attached files into a new folder: main.js, manifest.json, styles.css, hex-color-list.md, habit-calendar-001b-1.1.2.zip and SHA256SUMS. The automatically generated Source code archives require a developer build and are not the installation ZIP.

## 2. Verify downloads

Use the release SHA256SUMS, not the source snapshot checksum. It covers five payloads and not itself. Verify before copying to a phone.

Ubuntu, from the download directory:

```bash
sha256sum -c SHA256SUMS
```

macOS, from the download directory:

```bash
shasum -a 256 -c SHA256SUMS
```

Windows 11 PowerShell, opened in that directory:

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

Expect five OK results. Stop and download matching assets again after any error. Checksums detect byte mismatches, not publisher identity.

## 3. Windows 11 laptop

1. Install Obsidian from its official download page. Create/open rsn-test-vault and note its actual location, for example Documents\Obsidian\rsn-test-vault.
2. Close Obsidian. In File Explorer enable View → Show → Hidden items and File name extensions. Open the vault's .obsidian directory and create plugins if missing.
3. Right-click the installation ZIP → Extract All. Copy the enclosed habit-calendar-001b folder into .obsidian\plugins. The result must be .obsidian\plugins\habit-calendar-001b\main.js, without a second nested plugin folder.
4. Reopen the vault. Settings → Community plugins → Turn on community plugins. Enable Habit Calendar 001b and verify 1.1.2.
5. Press Ctrl+P and run Habit Calendar 001b: Open current month.

Do not rename main.js to main.js.txt. The runtime uses vault-relative paths; you do not enter a Windows drive path in the habit table.

## 4. Ubuntu laptop

1. Open rsn-test-vault once and close Obsidian.
2. In Files press Ctrl+H to show hidden files. Open the vault's .obsidian/plugins folder, creating plugins if needed.
3. Extract the installation ZIP and copy its habit-calendar-001b folder there. Alternatively copy the four loose assets into that folder.
4. Reopen Obsidian, enable community plugins and Habit Calendar 001b. Verify 1.1.2.
5. Press Ctrl+P and run Open current month.

## 5. MacBook or other Mac

1. Install Obsidian from its official download page. Open/create rsn-test-vault and quit Obsidian.
2. In Finder open the vault folder and press Command+Shift+Period to reveal hidden files. Open .obsidian/plugins, creating plugins if necessary.
3. Expand the ZIP and copy habit-calendar-001b into plugins. Check that main.js sits directly inside that plugin folder.
4. Reopen Obsidian, enable community plugins and Habit Calendar 001b, and verify 1.1.2.
5. Press Command+P and run Open current month.

For a vault intended for Obsidian Sync, choose a local folder outside iCloud/other sync roots. The separate iCloud route below uses iCloud alone for that vault.

## 6. Android manual installation

1. Install the official Obsidian app and create/open rsn-test-vault using device storage. Record the actual vault location. App-private storage is not accessible through the ordinary file-manager workflow.
2. Open the vault once, then force-stop Obsidian. Transfer verified assets from a computer, or download the same release.
3. Enable Show hidden files in the file manager. Create .obsidian/plugins/habit-calendar-001b inside the vault.
4. Copy main.js, manifest.json, styles.css and hex-color-list.md directly inside it. Or copy the extracted plugin folder into plugins.
5. Reopen Obsidian, enable community plugins and Habit Calendar 001b, then run Open current month from the command palette. Expect one calendar per row.

[Official Android storage guidance](https://obsidian.md/help/android).

## 7. iPhone/iPad preferred route: Obsidian Sync

This route also works across Windows, Ubuntu, macOS and Android. It requires an Obsidian Sync subscription. The plugin itself requires no payment or account.

1. On a computer, install and test 1.1.2 in rsn-test-vault as above. Enable the Sync core plugin, sign in and connect to a dedicated remote test vault.
2. Under Settings → Sync, enable the installed community plugin list and active community plugin list. Enable community plugin settings if you want remembered decisions to sync. Do not exclude Habit Tracker or its Records, Statistics and System subfolders.
3. Wait for sync completion. On iPhone/iPad install Obsidian from the App Store. Use its Obsidian Sync setup flow to connect to the SAME remote test vault. The local name can be rsn-test-vault; names alone do not establish a connection.
4. Configure the required plugin-sync preferences on the iPhone/iPad too. These preferences are device-specific. Wait for download completion, then fully close and reopen Obsidian.
5. Enable community plugins and verify Habit Calendar 001b version 1.1.2. Open the command palette from the ribbon/menu and run Open current month.
6. Test marking and restart persistence. Repeat setup separately on the iPad. Both phones and tablets use one calendar per row, including landscape and Split View.

Keep this vault outside iCloud syncing. [Official Sync settings](https://help.obsidian.md/sync/settings).

## 8. Apple-only alternative: manual plugin copy through a Mac/iCloud vault

This avoids a Sync subscription but requires a Mac for the straightforward hidden-folder installation procedure. It is an alternative vault arrangement, not an extra sync layer on the same vault.

1. On iPhone/iPad, create a separate rsn-test-vault in Obsidian with Store in iCloud enabled. This creates it inside the app's iCloud Drive/Obsidian folder. Use a unique test name if a vault with that name already exists.
2. Let iCloud finish syncing. On the Mac, locate that same vault under iCloud Drive → Obsidian and open it in Obsidian once. Quit Obsidian on both devices before copying plugin files.
3. On the Mac use Command+Shift+Period to reveal .obsidian. Copy the four verified release files into .obsidian/plugins/habit-calendar-001b. Preserve any data.json during an upgrade.
4. Allow iCloud to upload/download everything. Keep the vault downloaded using the available macOS Keep Downloaded option. Reopen the vault on the phone/tablet and enable community plugins and Habit Calendar 001b.
5. Verify version 1.1.2, then run Open current month. Confirm the downloaded files are fully available before diagnosing a missing plugin.

Do not assume the iOS Files app exposes .obsidian or provides the same hidden-file controls as Finder. If you lack a Mac and cannot access the configuration directory, use the Sync route for prerelease testing or Community installation after acceptance. There is no need to invent a phone-only hidden-folder copying procedure.

iCloud is an Apple-specific alternative here; it is not the recommended shared-vault solution for Ubuntu/Android. [Official sync-method guidance](https://help.obsidian.md/sync-notes).

## 9. After Community acceptance, on any platform

Open Settings → Community plugins → Browse. Search Habit Calendar 001b, check author harharhari, install and enable it. Obsidian downloads main.js, manifest.json and styles.css from the matching release. The starter color reference is embedded in main.js, so no separate color-file download is needed. This route installs the program, not your tracking history. Configure sync separately if desired.

## 10. First use and month selection

Run Open current month. A fresh vault starts with no enabled habits. Use Habit list and add the generic example rows in examples/habit-tracker-list.md. Save and choose Yes only for the intended replacement. This clears all current marks, including unchanged habits. Use No to retain the displayed month, or Apply habit list to retry later.

Tap/click a date to cycle unmarked, green, pink, unmarked. Earlier current-month dates work; future dates and previous months are locked. Choose month now uses a Month dropdown and a four-digit Year field (1970–9999). Select the month, enter the year and press Open; Enter also works in the year field.

Monthly Markdown notes render in Reading view or a rendered Live Preview block. Source mode shows the fenced code. The command opens the interactive view directly.

## 11. Upgrade from 1.1.1

Back up and finish sync. Close Obsidian on the device being updated. Replace main.js, manifest.json, styles.css and the plugin-folder hex-color-list.md using matching 1.1.2 files. Keep plugin data.json and the entire Habit Tracker folder, including its separate customized color reference. The plugin ID stays habit-calendar-001b. Reopen and verify 1.1.2. Let updates sync before using other devices. Never run the older Habit Calendar 001 against the same data.

## 12. Troubleshooting

Missing plugin: check the correct vault/configuration directory, folder nesting, exact extensions, complete download and restart. If using a custom config folder, substitute it for .obsidian everywhere.

Blank view: try the direct command and Reading view; record any notice/console error. Controls without calendars: verify Y rows and whether you declined a list change. Do not accept a destructive reset just to troubleshoot.

Different devices disagree: verify they connect to the same remote vault and wait for sync. Offline resets and late historical marks follow the documented revision/freeze rules. Preserve Statistics and System in backups.
