> Upgrading from Habit Calendar 001b 1.1.1/1.1.2: follow [MIGRATION-1.1.3.md](MIGRATION-1.1.3.md) first. The ID and installation folder change. Disable the old plugin on all devices and copy wanted settings before enabling the new one.

For repository cleanup, manual-kit distribution and existing-release handling, follow [the deployment update guide](DEPLOYMENT-UPDATE-GUIDE.md). Do not delete the whole repository or upload the outer handoff directories as source.

For complete 1.1.10 installation on Windows, Ubuntu, macOS, Android, iPhone and iPad, start with [INSTALL-DOWNLOAD.md](INSTALL-DOWNLOAD.md). The optional Linux helper below remains desktop-only.

# rsn habit calendar one b — installation and use

Version 1.1.10. Public author: harharhari. GPL-3.0-only.

## 1. Download and verify

Download the three attached files main.js, manifest.json and styles.css. Follow INSTALL-DOWNLOAD.md for provenance verification and platform-specific installation. The optional manual kit and its SHA256SUMS are separate from the Community release; CHECKSUMS.md describes their scope. No extra color download is needed because main.js embeds it.

## 2. Local desktop installation

1. Create an empty vault named `rsn-test-vault` and open it once in Obsidian 1.7.2+.
2. Close Obsidian.
3. Locate that vault's `.obsidian` folder. Linux: Ctrl+H shows hidden folders. macOS: Command+Shift+period. Use your configured alternative vault configuration folder instead of `.obsidian` if applicable.
4. Create `plugins/rsn-habit-calendar-one-b` inside it.
5. Copy `main.js`, `manifest.json`, and `styles.css` into that folder.
6. Reopen the vault. Settings → Community plugins → allow community plugins → enable **rsn habit calendar one b**.
7. Open the command palette (Ctrl+P, or Command+P on macOS). Run **rsn habit calendar one b: Open current month**.

Correct layout:

```text
rsn-test-vault/
  .obsidian/
    plugins/
      rsn-habit-calendar-one-b/
        main.js
        manifest.json
        styles.css
```

If you have the optional manual kit, extract its installation ZIP and copy its enclosed `rsn-habit-calendar-one-b` folder into `plugins/`. Do not nest that folder twice. LICENSE and NOTICE in the ZIP may remain there. Do not copy the ZIP or SHA256SUMS into the plugin folder. No npm, Node.js, Python, or compilation is required to install ready-built files.

The optional Python installer in the source repository works after a developer runs npm ci --ignore-scripts and npm run build to populate release/:

```bash
python3 scripts/install.py --vault "/absolute/path/to/test-vault"
```

It backs up an existing destination under the NEW ID. Use --migrate-from-001b to copy old settings only when the new destination has none. It does not disable any plugin; disable the old identities first.

If the plugin is missing, restart Obsidian and inspect the exact folder/name/extensions. Download the actual release assets, not saved GitHub HTML pages.

## 3. Mobile testing

Use Obsidian Sync with installed community plugins, active plugins, and plugin settings configured as appropriate. Let the desktop-installed test vault finish syncing, connect the mobile device, allow community plugins, and enable rsn habit calendar one b. Verify that the mobile plugin ID is `rsn-habit-calendar-one-b`, not the old ID. Restart if the plugin list has not refreshed. Android permits manual copying with a suitable file manager; iOS/iPadOS access to hidden configuration folders is more restricted, so use the desktop-to-mobile sync workflow. A private GitHub repository does not prevent manual installation of downloaded files.

## 4. Migrate an existing 001 vault

1. Finish sync on all devices; make an independent full vault backup, including `.obsidian` and `Habit Tracker/System`.
2. Disable **Habit Calendar 001** on every device. Do not let an offline device continue using it.
3. Install and enable **rsn habit calendar one b** as above.
4. The existing `Habit Tracker` folder is reused. Existing IDs and monthly notes remain readable.
5. Previous reports freeze as saved. A legacy report whose original events are unavailable may display only saved totals.
6. If current list and current calendar differ, respond to the replacement warning deliberately.

Do not downgrade this vault to 001 after reset records are created. For rollback, restore the whole pre-upgrade vault backup with Obsidian closed and coordinate sync first. Testing on a COPY is preferable.

## 5. Color reference

First refresh creates `Habit Tracker/hex-color-list.md`. Use **Details → Color reference** or **Open color reference** from the command palette. View in Reading view for swatches. The file contains 147 CSS3 named colors from W3C, including aliases such as gray/grey. These are web CSS values, not every historical X11 rgb.txt value. `rebeccapurple` belongs to CSS4 and is not included.

The editable table has exactly:

```markdown
| Color Name | Hex Code | Color Shade |
|---|---|---|
| My peach | #F8CBAD | |
| My yellow | #FFE699 | |
```

Append custom rows to the table or change an existing Hex Code. Leave Color Shade empty: 001b renders its swatch from Hex Code in Reading view. Invalid codes display a warning instead. Source mode shows Markdown/HTML rather than painted swatches. The postprocessor uses the Hex Code column as authoritative, so editing it updates the displayed shade even if an old inline swatch remains in the Markdown.

The root release file is a starter/reference. Edit the copy in `Habit Tracker/` for everyday use. The plugin embeds the same starter in main.js, because Community installation does not fetch extra Markdown assets. The vault copy is created only if missing; user customizations survive refresh and plugin updates. You can copy your customized reference into `Habit Tracker/hex-color-list.md` before first launch instead.

Use Choose color in the habit editor to select a name, hex code and swatch, or enter #RRGGBB directly. Reopen the editor after changing the reference. Changing the reference alone does not update existing headers.

## 6. Habits and current-month replacement

Open **Details → Habit list** for the validated editor. Its **Open Markdown file** button also lets you edit `Habit Tracker/habit-tracker-list.md` directly:

```markdown
| Habit | Generate calendar | Header color |
|---|---|---|
| Walking | Y | #90EE90 |
| Reading | Y | #ADD8E6 |
| Yoga | N | #FFDAB9 |
```

Keep automatically assigned `<!-- habit-id: ... -->` comments when renaming. Names must be unique and must not contain `|`. Y/N is case-insensitive. Colors must be six-digit hex; blank or invalid values block saving and processing until corrected. Blank rows of data are not supported. The order of rows becomes calendar order.

Meaningful changes to names, colors, order, Y/N, addition, or deletion show this exact dialog:

> The current months entries will be overwritten and there would be loss of data

- **No**, Escape, or closing the dialog: do not replace the current calendar. Existing marks remain. The edited habit-list file remains edited and supplies the next new month's initial catalog. The same declined edit is not prompted repeatedly; use **Apply habit list** to reconsider it. A different list edit prompts again.
- **Yes**: clear **all** marks for the current month, rebuild from only Y rows, apply current names/colors/order, and recalculate the current report. N and deleted rows disappear. This includes clearing marks for habits whose rows did not change.
- Whitespace-only table reformatting and editing only the color reference do not trigger replacement.
- A list/month change while the dialog is open invalidates that approval. A fresh confirmation is needed.

A recovery snapshot is kept under `System/Backups/`, and immutable old events remain on disk. They are excluded from active results after reset. There is no one-click undo; use a coordinated backup restore for recovery. This preserves evidence without allowing late old marks to reappear.

## 7. Daily use and history

Tap dates to cycle unmarked → green → pink → unmarked. Earlier days of the **current** month remain editable. Future dates and all previous months are locked. Use a wide desktop pane for six columns; mobile shows one column. Monday starts the week. Search filters visible cards only. Statistics counts the entire month's active catalog.

A monthly note such as `Habit Tracker/Months/2026-10.md` displays `2026-10 October 2026`. Open it in Reading view, or use the dedicated Open current month command. Existing `habit-calendar` code blocks remain supported.

Statistics use green / elapsed calendar days, no schedules. Pink/blank days break streaks. Streaks are within-month. On rollover, the **last saved report and calendar are frozen as-is**, including their saved as-of date. If Obsidian was closed before the month's last day, the report keeps that earlier as-of date rather than silently recalculating historical percentages. A past month with no existing report is calculated once from available records when first opened, then frozen.

Late records are retained and counted in a notice, but do not alter frozen marks, names, colors, or totals. 001b snapshots retain complete calendar state, so old records can be removed without losing that snapshot. Older 001 archives may require original records to display calendar details.

## 8. Sync, retention, and backups

Sync before month-end and before confirming a replacement. For resets use the primary Linux computer, finish sync, then resume marking on other devices. Concurrent offline resets resolve deterministically by timestamp/event ID, but can discard each other's revisions. The plugin is not a distributed locking service. Resolve sync-conflict copies deliberately.

Keep `Statistics/` and `System/` permanently. After verifying frozen snapshots, you may manually delete older `Months/YYYY-MM.md` pages and `Records/YYYY-MM/` directories. They are not recreated by refresh. Snapshot data still occupies some space deliberately, and statistics can still be viewed. Never delete the current month's records as a cleanup operation.

To uninstall, disable 001b and remove only its plugin installation directory. Data remains in `Habit Tracker/`. No network requests or telemetry are performed by this plugin.

## 9. Optional generation while Obsidian is closed (Linux)

Without an external helper, a new page appears when Obsidian is open on/after the first. The plugin checks every minute and on startup. For creation while the app is closed, the optional Python helper can run on the primary Linux computer only. It only creates missing current-month data; it cannot approve list replacements and never edits historical reports. Frozen snapshot materialization runs when Obsidian opens.

From a permanent source directory:

```bash
python3 scripts/monthly_helper.py --vault "/absolute/path/to/vault"
python3 scripts/systemd_units.py --vault "/absolute/path/to/vault" --output "/absolute/path/to/generated-units"
mkdir -p "$HOME/.config/systemd/user"
cp /absolute/path/to/generated-units/rsn-habit-calendar-one-b.service "$HOME/.config/systemd/user/"
cp /absolute/path/to/generated-units/rsn-habit-calendar-one-b.timer "$HOME/.config/systemd/user/"
systemctl --user daemon-reload
systemctl --user enable --now rsn-habit-calendar-one-b.timer
systemctl --user list-timers rsn-habit-calendar-one-b.timer
```

Replace the example paths and review the generated units before copying. If the old timer is installed, stop it first with `systemctl --user disable --now habit-calendar-001.timer`. To stop the new helper use `systemctl --user disable --now rsn-habit-calendar-one-b.timer`. Do not run old and new timer installations together. The computer must be running for any local timer to execute. Use `Habit Tracker/System/config.md` to set a valid IANA timeZone; keep it identical on every device. Default is `Asia/Kolkata`.

## Version 1.1.10 interface and upgrade

From 1.1.3–1.1.9, keep the same plugin folder and replace only main.js, manifest.json and styles.css with matching 1.1.10 files while Obsidian is closed. Preserve data.json and the complete Habit Tracker folder. Reopen, enable the plugin and run Open current month. No Welcome page is needed. Habit list now opens the editor described in TUTORIAL.md. Details opens tracker files separately. Only the five specified Habit Tracker entries are hidden in the file explorer.

Use Add habit, enter its name, choose Y/N, and choose a color or type #RRGGBB. Save the list and answer the month-replacement confirmation. No preserves this month's marks; Yes clears all current-month marks. On mobile/tablets, editor controls stack vertically. Save before closing the editor. Correct old invalid/blank colors in the Markdown note if the editor asks for correction.



## Version 1.1.10 release recovery

The 1.1.9 failure came from an attached manifest declaring 1.1.7. Keep the guard. The new workflow checks all three downloaded assets against the tagged build and safely resumes matching drafts. It refuses stale/conflicting assets and published releases. Follow [the detailed recovery and deployment guide](RELEASE-RECOVERY.md) and [review evidence](REVIEW-RESPONSE-1.1.10.md). Native acceptance and hosted 1.1.10 checks remain pending.
