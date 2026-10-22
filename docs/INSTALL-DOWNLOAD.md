# Download, install and upgrade 1.1.1

## What to download

Open the repository's Releases page and select tag **1.1.1**. Expand Assets. Download main.js, manifest.json, styles.css, hex-color-list.md, habit-calendar-001b-1.1.1.zip and SHA256SUMS into one new folder. A private release requires GitHub access; public users can download only after the repository/release is public. GitHub's Source code archives are for developers and do not contain the built plugin.

In that download folder run `sha256sum -c SHA256SUMS` on Ubuntu. Expect five OK results. The checksum file does not hash itself. An error or missing file means you should stop and download the matching assets again. Checksums detect mismatched bytes; a checksum from the same compromised source would not prove authenticity.

## Ubuntu laptop

1. Create/open **rsn-test-vault** in Obsidian. Note its actual filesystem location.
2. Close Obsidian. In Files press Ctrl+H to show hidden files. Open the vault's `.obsidian` directory, create `plugins` if missing.
3. Extract the installation ZIP. Copy the enclosed `habit-calendar-001b` folder into `plugins`. There must be only one folder with that name between plugins and main.js.
4. Alternatively create that folder yourself and copy the four loose files into it. The included LICENSE and NOTICE may stay with a ZIP installation.
5. Reopen Obsidian → Settings → Community plugins → Turn on community plugins. Enable Habit Calendar 001b and verify version 1.1.1.
6. Press Ctrl+P and run **Habit Calendar 001b: Open current month**. The first empty installation displays controls but no calendars until you add Y rows and accept the list.

## Android phone, manual installation

1. Install the official Obsidian app. Create/open **rsn-test-vault** using **device storage**, for example Documents/Obsidian/rsn-test-vault. Your actual location may differ. App-private storage is not accessible for this file-copy method. [Official Android storage guide](https://obsidian.md/help/android).
2. Open that vault once, then force-stop Obsidian from Android Settings → Apps → Obsidian.
3. Transfer the files verified on Ubuntu by USB, or download them from GitHub on the phone. In your file manager turn on Show hidden files.
4. Create `.obsidian/plugins/habit-calendar-001b/` inside the actual vault. Copy the same four loose files directly inside it, or copy the extracted plugin folder into `.obsidian/plugins/`.
5. Reopen Obsidian. Enable community plugins and Habit Calendar 001b. Open the command palette from the mobile ribbon/menu and run **Open current month**. The command may be prefixed with the plugin name.
6. Verify one calendar per row and touch marking. Restart and confirm marks remain. No Python, Node.js, terminal or Android development kit is needed on the phone.

If you configured an alternative Obsidian configuration folder, substitute it for `.obsidian` throughout these instructions.

## Upgrade on either platform

Back up first and finish syncing. Close or force-stop Obsidian. Replace only main.js, manifest.json, styles.css and the plugin-folder hex-color-list.md with matching release versions. Keep existing data.json. Keep the whole `Habit Tracker` folder in the vault, including its separate editable hex-color-list.md. Reopen and verify the version. Replacing code does not require accepting a habit-list reset.

The ZIP and SHA256SUMS stay in your download directory. They are not runtime plugin files. Never delete the complete vault or plugin folder as an upgrade step.

## First calendars

Open Habit list. Add the three example rows from README beneath the header and save. Choose Yes only when you intend to clear all current-month marks. Walking and Reading appear; Yoga N does not. A Markdown monthly note renders the calendar in Reading view or a rendered Live Preview block. Source mode displays code. The Open current month command opens the interactive view directly.

## After Community acceptance

On each device open Settings → Community plugins → Browse. Search Habit Calendar 001b and check author harharhari. Install, enable, then run Open current month. Obsidian downloads the three standard assets; the color starter is embedded in main.js, so a fourth file is not required for Community installation.

## Troubleshooting

- Missing plugin: check folder nesting, hidden configuration directory and exact file names. Avoid .txt or (1) suffixes.
- Old version: overwrite files in the correct vault, wait for sync and restart.
- Controls but no calendars: verify Y rows and whether the list was declined. Apply habit list reopens confirmation.
- Blank screen: try the direct command and Reading view. Record version/device/error text before resetting anything.
- Different data on devices: identical vault names do not connect vaults. Configure a sync service or deliberately transfer the complete data folder while both apps are closed.
