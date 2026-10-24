> Upgrading from Habit Calendar 001b 1.1.1/1.1.2: follow [MIGRATION-1.1.3.md](MIGRATION-1.1.3.md) first. The ID and installation folder change. Disable the old plugin on all devices and copy wanted settings before enabling the new one.

# Android setup — rsn-test-vault

For rsn habit calendar one b 1.1.6. No Python, Node.js or terminal is needed on the phone.

## Recommended: existing Linux vault through Obsidian Sync

1. On Linux open **rsn-test-vault** and back it up. Disable Habit Calendar 001 on every device before using 001b; both use the same Habit Tracker data folder.
2. Install the downloaded 001b files into `rsn-test-vault/.obsidian/plugins/rsn-habit-calendar-one-b/`. Enable it and verify it opens correctly on Linux.
3. In Settings → Sync, connect this vault to your intended remote test vault. Do not connect it to an unrelated production vault.
4. Under Vault configuration sync enable the installed community plugin list, active community plugin list, and community plugin settings. Do not exclude Habit Tracker or its System, Records and Statistics subfolders. Restart and wait for Fully Synced.
5. Install Obsidian from Google Play on Android. From its vault switcher select Setup Obsidian Sync, sign in, select the SAME remote test vault, and name the local vault **rsn-test-vault**. If the vault is already connected on the phone, open it instead of creating a duplicate.
6. Configure the matching plugin sync options on Android; these sync preferences must be set per device. Wait for download completion, then force-close and reopen Obsidian.
7. Open rsn-test-vault → Settings → Community plugins. Allow community plugins and enable **rsn habit calendar one b**. Keep 001 disabled.
8. From the mobile ribbon open Command palette. Search **rsn habit calendar one b: Open current month** and run it.

Sync requires an Obsidian Sync subscription. Neither this plugin nor GitHub automatically syncs vault data. Local vault names alone do not establish a connection; both devices must connect to the same remote vault.

## Alternative: manual local installation without Sync

1. Install Obsidian from Google Play (or the APK linked on https://obsidian.md/download).
2. Open the existing **rsn-test-vault**, or create it using **device storage**. A possible location is `Internal storage/Documents/Obsidian/rsn-test-vault`; use the location you actually chose. Device storage makes the vault accessible to file managers. Do not choose app-private storage for this manual copying workflow.
3. Open the vault once, then close Obsidian. In Android Settings → Apps → Obsidian you can use Force stop before replacing plugin files.
4. Download main.js, manifest.json and styles.css. Verify them on a computer using the provenance/checksum instructions in INSTALL-DOWNLOAD.md, then transfer over USB.
5. In a file manager enable Show hidden files. Inside the vault create `.obsidian/plugins/rsn-habit-calendar-one-b/` (or use the vault's alternative configuration directory if configured).
6. Copy **main.js**, **manifest.json**, and **styles.css** directly into this directory. If using the optional manual kit, extract its installation ZIP and copy the enclosed rsn-habit-calendar-one-b folder into `.obsidian/plugins/`. Do not nest it twice. The ZIP and SHA256SUMS need not be in the plugin folder.
7. Reopen Obsidian, select rsn-test-vault, allow community plugins, and enable rsn habit calendar one b. If it is missing, check the filenames have not acquired .txt or (1) suffixes and restart.
8. Run **Open current month** from the command palette. The plugin creates its editable data under `rsn-test-vault/Habit Tracker/`.

Expected structure:

```text
rsn-test-vault/
  .obsidian/plugins/rsn-habit-calendar-one-b/
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

## Upgrade an existing installation to 1.1.6

Follow [MIGRATION-1.1.3.md](MIGRATION-1.1.3.md). The old plugin folder is habit-calendar-001b and the new one is rsn-habit-calendar-one-b. Disable the old plugin first, force-stop Obsidian, install matching files in the new folder and copy wanted data.json before activation. Preserve Habit Tracker. Restart and verify the new name/version. Do not run both identities.
