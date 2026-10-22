# Android setup — rsn-test-vault

For Habit Calendar 001b 1.1.1. No Python, Node.js or terminal is needed on the phone.

## Recommended: existing Linux vault through Obsidian Sync

1. On Linux open **rsn-test-vault** and back it up. Disable Habit Calendar 001 on every device before using 001b; both use the same Habit Tracker data folder.
2. Install the downloaded 001b files into `rsn-test-vault/.obsidian/plugins/habit-calendar-001b/`. Enable it and verify it opens correctly on Linux.
3. In Settings → Sync, connect this vault to your intended remote test vault. Do not connect it to an unrelated production vault.
4. Under Vault configuration sync enable the installed community plugin list, active community plugin list, and community plugin settings. Do not exclude Habit Tracker or its System, Records and Statistics subfolders. Restart and wait for Fully Synced.
5. Install Obsidian from Google Play on Android. From its vault switcher select Setup Obsidian Sync, sign in, select the SAME remote test vault, and name the local vault **rsn-test-vault**. If the vault is already connected on the phone, open it instead of creating a duplicate.
6. Configure the matching plugin sync options on Android; these sync preferences must be set per device. Wait for download completion, then force-close and reopen Obsidian.
7. Open rsn-test-vault → Settings → Community plugins. Allow community plugins and enable **Habit Calendar 001b**. Keep 001 disabled.
8. From the mobile ribbon open Command palette. Search **Habit Calendar 001b: Open current month** and run it.

Sync requires an Obsidian Sync subscription. Neither this plugin nor GitHub automatically syncs vault data. Local vault names alone do not establish a connection; both devices must connect to the same remote vault.

## Alternative: manual local installation without Sync

1. Install Obsidian from Google Play (or the APK linked on https://obsidian.md/download).
2. Open the existing **rsn-test-vault**, or create it using **device storage**. A possible location is `Internal storage/Documents/Obsidian/rsn-test-vault`; use the location you actually chose. Device storage makes the vault accessible to file managers. Do not choose app-private storage for this manual copying workflow.
3. Open the vault once, then close Obsidian. In Android Settings → Apps → Obsidian you can use Force stop before replacing plugin files.
4. Download the six release attachments. For verification, the simplest option is to verify them on Linux using `sha256sum -c SHA256SUMS`, then transfer the verified files over USB.
5. In a file manager enable Show hidden files. Inside the vault create `.obsidian/plugins/habit-calendar-001b/` (or use the vault's alternative configuration directory if configured).
6. Copy **main.js**, **manifest.json**, **styles.css**, and **hex-color-list.md** directly into this directory. Alternatively extract the installation ZIP and copy the enclosed habit-calendar-001b folder into `.obsidian/plugins/`. Do not nest it twice. The ZIP and SHA256SUMS need not be in the plugin folder.
7. Reopen Obsidian, select rsn-test-vault, allow community plugins, and enable Habit Calendar 001b. If it is missing, check the filenames have not acquired .txt or (1) suffixes and restart.
8. Run **Open current month** from the command palette. The plugin creates its editable data under `rsn-test-vault/Habit Tracker/`.

Expected structure:

```text
rsn-test-vault/
  .obsidian/plugins/habit-calendar-001b/
    main.js
    manifest.json
    styles.css
    hex-color-list.md
  Habit Tracker/
    habit-tracker-list.md
    hex-color-list.md
    Months/
    Records/
    Statistics/
    System/
```

Copying plugin files alone does not transfer tracking history. To use existing history, sync or transfer the complete Habit Tracker directory while both apps are closed. A manually installed standalone vault will not send marks back to Linux unless you configure a sync service.

## Phone acceptance test

Use a disposable test month/vault because Yes clears all current-month entries.

1. Open current month: title follows `2026-10 October 2026`; Monday is first; one calendar per row.
2. Edit Habit list with Walking Y #90EE90, Reading Y #ADD8E6, Yoga N #FFDAB9. Save. Choose Yes. Only two calendars should appear.
3. Tap an eligible date three times: green → pink → unmarked. Earlier current-month dates work; future dates do not.
4. Add a mark, close/reopen Obsidian, verify it persists and Statistics agrees.
5. Open Color reference in Reading view. Add `| My shade | #123456 | |` to its table in Source mode; return to Reading view and check the swatch.
6. Change a habit's header color and choose No: existing header and marks stay. Use Apply habit list and choose Yes: current marks clear and new header appears.
7. Verify previous months are read-only and their saved totals remain unchanged. Use the synthetic fixture instructions in TESTING-CHECKLIST.md if no historical month exists.
8. Test portrait/landscape, scrolling through 60 habits, dialog buttons, and Android back navigation.
9. With Sync configured, mark different dates on Linux and Android and verify convergence. Perform list resets only on the primary Linux computer after sync; let resets sync before marking on Android.

No Android background scheduler is included. Monthly creation occurs while Obsidian is open or when it next opens. The optional Linux helper remains a separate desktop setup.

## Official references

- Android vault storage: https://obsidian.md/help/android
- Sync setup: https://help.obsidian.md/sync/setup
- Plugin sync settings: https://help.obsidian.md/sync/settings
- Android emulator acceleration: https://developer.android.com/studio/run/emulator-acceleration#vm-linux

## Upgrade the blank-screen Android installation to 1.1.1

1. Back up rsn-test-vault and finish any pending sync. On Ubuntu verify the new download with `sha256sum -c SHA256SUMS` from its download folder.
2. Force-stop Obsidian on Android. Replace main.js, manifest.json, styles.css and hex-color-list.md in the existing `rsn-test-vault/.obsidian/plugins/habit-calendar-001b/` directory with the matching 1.1.1 files. Preserve data.json and the entire Habit Tracker folder. Do not copy the source ZIP or a second nested plugin directory.
3. If using Sync instead, update the plugin on Ubuntu, sync installed plugins, wait for Android to receive the update, then restart Android Obsidian. Avoid editing the plugin files simultaneously on both devices.
4. In Android Settings → Community plugins, verify Habit Calendar 001b reports version 1.1.1 and is enabled. Keep the old Habit Calendar 001 disabled.
5. Run **Habit Calendar 001b: Open current month** from the command palette. This opens the interactive view directly. A monthly Markdown note must be in Reading view (or a rendered Live Preview block), not Source mode, to display its calendars.
6. If the controls appear but no habits do, use the existing habit list with Y entries. Do not accept a replacement warning merely to troubleshoot: Yes clears current-month marks.
7. Run the phone acceptance checklist above. If still blank, record the Obsidian version, Android version, plugin version, whether the command is listed, and any notice/error text. These distinguish installation, view rendering and storage failures.

The browser tests are not Android certification. See ANDROID-TEST-REPORT.md for the emulator limitation.
