# rsn habit calendar one b

Monthly habit calendars for Obsidian by **harharhari**. Version **1.1.7**, licensed under **GPL-3.0-only**.

Track daily activities with a named calendar for each habit. Wide desktop views show six calendars per row; phones and tablets show one. Click or tap a date to cycle **unmarked → green → pink → unmarked**. Weeks start Monday. The monthly title follows `2026-10 October 2026`.

## Layout examples

These browser-rendered examples use generic habits and mocked Obsidian APIs; they are not device screenshots.

![Six-column desktop layout](docs/images/browser-desktop.png)

<img src="docs/images/browser-mobile.png" alt="Single-column mobile browser layout" width="280">

## Download and install

Download the assets from [GitHub Releases](https://github.com/harharhari/rsn-habit-tracker-obsidian-plugin/releases/tag/1.1.7). This link becomes available when the maintainer publishes the release and grants access. The repository may remain private during testing.

1. Back up your vault. Use `rsn-test-vault` for the first trial.
2. Download main.js, manifest.json and styles.css and verify their provenance/checksums using the [platform-specific instructions](docs/INSTALL-DOWNLOAD.md).

The following file-copy steps apply to desktop and accessible Android vaults. For iPhone/iPad, follow the [Obsidian Sync or Mac-assisted iCloud setup](docs/INSTALL-DOWNLOAD.md) instead.

3. Close Obsidian. Create `<vault>/.obsidian/plugins/rsn-habit-calendar-one-b/` and copy the three files directly into it. For an upgrade from 1.1.1/1.1.2, follow the [identity migration guide](docs/MIGRATION-1.1.3.md): disable the old plugin and copy wanted data.json into the new folder.
4. Reopen Obsidian. Under Settings → Community plugins, allow community plugins and enable **rsn habit calendar one b**.
5. Run **rsn habit calendar one b: Open current month** in the command palette. A new vault starts with an empty habit list. Follow the tutorial to add your own rows.

GitHub's automatically generated Source code ZIP requires a developer build; use the three attached program files. No Node.js or Python is required for normal use. Android manual installation requires a vault in accessible device storage.

After Community acceptance, users can instead search for **rsn habit calendar one b** by **harharhari** in Settings → Community plugins → Browse, then install and enable it. This package does not claim directory acceptance.

## Habit list and colors

Click **Details → Habit list** to open the editor. Use **Add habit**, enter a name, select Y/N and choose a color or type #RRGGBB. Click **Save habit list** to save and receive the current-month confirmation. The underlying Markdown remains editable through **Open Markdown file**:


```markdown
| Habit | Generate calendar | Header color |
|---|---|---|
| Walking | Y | #90EE90 |
| Reading | Y | #ADD8E6 |
| Yoga | N | #FFDAB9 |
```

Y displays a calendar, N excludes it when you apply the list. Keep the hidden habit-ID comments that the plugin adds. Choose a color by name, hex code and swatch in the editor, or enter a custom six-digit code. `Habit Tracker/hex-color-list.md` supplies 147 CSS3 colors and supports custom rows. View the color note in Reading view to see its swatches.

**Applying a habit-list change with Yes clears every current-month mark**, including marks for unchanged habits. No keeps the displayed month and marks unchanged, while leaving your edited list in place. Use Details → Apply habit list to reconsider a declined change. Previous months stay read-only and keep their saved statistics and calendar snapshot. Late synced entries do not alter frozen history.

## Monthly behaviour

Earlier dates within the current month are editable. Future dates are disabled. Completion uses green days divided by elapsed calendar days; pink and blank dates break month-local streaks. There are no schedules or automatic missed-day marks.

A new month appears while Obsidian is running, or on its next opening. The optional Linux helper supports desktop scheduling. There is no Android background scheduler. The initial timezone is Asia/Kolkata; keep `Habit Tracker/System/config.md` consistent across devices.

## Guides

- [Windows, Ubuntu, Mac, Android, iPhone and iPad tutorial (PowerPoint)](docs/rsn-habit-calendar-one-b-tutorial.pptx)
- [Migration from the old plugin ID](docs/MIGRATION-1.1.3.md)
- [First-use tutorial](docs/TUTORIAL.md)
- [Install, upgrade and download guide](docs/INSTALL-DOWNLOAD.md)
- [Android and optional Sync](docs/ANDROID-rsn-test-vault.md)
- [Maintainer testing and Community submission](docs/GITHUB-AND-COMMUNITY-RELEASE.md)
- [Acceptance checklist](docs/TESTING-CHECKLIST.md) and [test evidence](docs/VALIDATION.md)
- [Final design and open questions](docs/DESIGN-DECISIONS.md)
- [Exact repository inventory](docs/FILES-TO-PUSH.md)

## Compatibility and data

Version 1.1.7 targets Windows 11, Ubuntu 24.04.3, current stable macOS, Android, iOS and iPadOS with the same plugin bundle. Phones and tablets show one calendar per row. Wide desktop panes show six; narrow panes show one. The month picker uses a Month dropdown and Year field on every platform.

The maintainer previously reported 1.1.1 working on Ubuntu/Android. Version 1.1.7 device acceptance is pending. Exact Apple OS, Android and Obsidian versions must be recorded during testing. The manifest minimum 1.7.2 is an API compatibility floor, not a completed minimum-device test.

No plugin network requests, telemetry or runtime Node/Electron imports. Sync is a separate service. Use optional Obsidian Sync across all platforms, or a separate Apple-only iCloud vault. Follow [MIGRATION-1.1.3.md](docs/MIGRATION-1.1.3.md) to preserve data.json and Habit Tracker across the ID change. Do not run old Habit Calendar 001 with the same records.

See [all-platform installation](docs/INSTALL-DOWNLOAD.md), [platform testing](docs/PLATFORM-TESTING.md) and [release notes](docs/RELEASE-NOTES-1.1.7.md).

## Build

Developers need Node.js 22+ with npm. Python 3.9+ is needed only for helper tests.

```bash
npm ci --ignore-scripts
npm run check
npm run test:helper
```

`npm run build` is the production build command. `npm run check` runs strict TypeScript checking and official Obsidian ESLint checks, builds, tests and verifies assets. `community-release/` contains the three supported files; `release/` contains an optional six-file manual kit. CI checks pushes and pull requests. The separate manually dispatched workflow attests an existing tag and creates a draft release; it does not publish automatically.

Repository-root `SHA256SUMS` verifies this prepared source snapshot. The separate release `SHA256SUMS` verifies the four loose installation files and installation ZIP. These are different inventories. See [checksum instructions](docs/CHECKSUMS.md).

## Support and license

Report reproducible problems through [GitHub Issues](https://github.com/harharhari/rsn-habit-tracker-obsidian-plugin/issues). Include plugin/app versions, OS, steps and error text, but remove personal vault content. [GPL-3.0-only](LICENSE). Copyright © 2026 harharhari. See [NOTICE](NOTICE).

## Version 1.1.7 Community review changes

For the npm 404 on Ubuntu, Windows or macOS, follow [CI troubleshooting](docs/CI-TROUBLESHOOTING.md). Upload the repaired root lockfile and run the new commit. See [release notes](docs/RELEASE-NOTES-1.1.7.md) and [validation](docs/VALIDATION.md). An upgrade from 1.1.3 keeps the same plugin folder, data.json and Habit Tracker records.

See [review responses](docs/REVIEW-RESPONSE-1.1.5.md) for typed source, runtime data validation, scoped tracker-folder discovery, and the three-asset attested release process. No new data migration or reset is required when upgrading from 1.1.4.

## Updating the GitHub repository and distributing test kits

Keep the existing repository/history and update source files in place. The optional manual-downloads handoff folder does not belong in this source tree or on the Community release. CI already publishes equivalent test-kit artifacts. See the [detailed deployment update guide](docs/DEPLOYMENT-UPDATE-GUIDE.md) for Git/web steps, obsolete-file cleanup, artifact downloads, optional separate permanent downloads and Obsidian upgrades. Normal users need only the three release files or the Community installer.

## Calendar workspace in 1.1.7

Open current month from the calendar ribbon or command palette. The main toolbar contains only Previous, Choose month, Next and Details, plus the Search habits field. Details contains Habit list, Color reference, Apply habit list and Statistics. There is no Welcome page.

Habit list opens a dedicated editor: add/remove habits, select Y/N, choose a reference color by name/hex/swatch or enter a custom #RRGGBB value. Save immediately offers the existing Yes/No month-reset confirmation for meaningful changes. Yes clears ALL current-month marks. No preserves the displayed month and keeps the list saved. Previous months remain frozen.

Details opens the tracker folders and reference notes on a separate plugin page. Only the five specified tracker entries are hidden in the file explorer. See [the tutorial](docs/TUTORIAL.md) and [1.1.7 design decisions](docs/DESIGN-DECISIONS.md).
