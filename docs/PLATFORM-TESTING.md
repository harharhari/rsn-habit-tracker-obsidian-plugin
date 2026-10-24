> Upgrading from Habit Calendar 001b 1.1.1/1.1.2: follow [MIGRATION-1.1.3.md](MIGRATION-1.1.3.md) first. The ID and installation folder change. Disable the old plugin on all devices and copy wanted settings before enabling the new one.

# 1.1.6 platform acceptance and debugging

Targets: Windows 11, Ubuntu 24.04.3, latest stable macOS, Android, iOS and iPadOS at testing time. Record actual version/build numbers and device models; "latest" is a target, not a reproducible result. The manifest retains an API compatibility floor of Obsidian 1.7.2, not a tested-device claim.

## Automated checks on a development computer

Install Node.js 22+ with npm. From the repository run npm ci --ignore-scripts, then npm run check. This runs official Obsidian lint and metadata checks, builds the runtime, runs 39 JavaScript tests, checks portable imports and generates the release/checksums. On Linux with Python run npm run test:helper for 11 helper/installer tests.

GitHub Actions now defines ubuntu-latest, windows-latest and macos-latest jobs for npm run check. Their uploaded artifacts are named by OS. These jobs are pending until you upload and run them; they do not launch Obsidian or test iOS. Linux alone runs the optional Python helper tests. Compare the release asset checksums across all three jobs before choosing attachments. .gitattributes keeps text line endings reproducible.

Optional browser test setup (separate development tools directory): npm install --prefix /tmp/habit-browser-tools playwright. Install the matching Chromium and WebKit browsers with that tools installation. Set NODE_PATH to its node_modules and run npm run test:browser. BROWSER_ENGINE=webkit chooses WebKit, default chromium. CHROME_PATH optionally selects installed Chrome. SCREENSHOT_DIR saves screenshots. On Windows set environment variables using PowerShell $env:NAME; on POSIX shells use NAME=value before the command. Required OS browser dependencies must also be available.

These tests use mocked Obsidian APIs. Playwright WebKit on Linux is useful engine coverage but is neither Safari on macOS nor the iPhone WKWebView.

## Real-device checklist, each target

Use a disposable rsn-test-vault, download release 1.1.6 and verify its checksums. Record exact OS version, Obsidian version, device and release hash.

1. Fresh install: enable, open current month, add the starter list and accept replacement in the empty month. Confirm two Y calendars and no N calendar.
2. Layout: six columns in a wide desktop pane; one column in a narrow pane and on Android/iPhone/iPad. Check iPad landscape and Split View. Test scrolling through the 60-habit example.
3. Input: mouse, touch and keyboard where available. Cycle none/green/pink/none once per activation. Verify future dates are disabled and prior current-month dates editable. Check search focus, keyboard dismissal, 44px mobile toolbar controls and 16px input text.
4. Month picker: select February 2028 and verify leap day. Enter 1969 and confirm validation; choose a valid year and open. Test a hardware keyboard's Enter on desktop/iPad.
5. Persistence: mark, close/reopen and verify stats. Upgrade an existing 1.1.1 test vault and compare records, history, data.json and custom colors. Code upgrade alone must not reset marks.
6. Windows: edit the list with CRLF and a UTF-8 BOM, Unicode names, and a vault location containing spaces. No platform-specific filename errors should occur.
7. Colors and resets: execute TESTING-CHECKLIST.md. Test No, then Apply habit list and Yes. Yes clears all current marks; previous months remain identical.
8. History: run the synthetic fixture in TESTING-CHECKLIST.md. Apply late records and confirm on-screen history and retained totals agree and stay frozen.
9. Sync: with the chosen service, mark separate dates offline on two devices, reconnect and verify current-generation merge. Then test an offline old-generation mark arriving after a reset. Do not mix iCloud and Obsidian Sync on one vault.
10. Lifecycle: background the phone, reopen it, and use Refresh if needed. Check after month rollover, rotation, theme change, and disabling/re-enabling the plugin. No background-execution guarantee is claimed.

## Official debugging methods

Obsidian's [mobile development guide](https://docs.obsidian.md/Plugins/Getting%20started/Mobile%20development) documents desktop emulation with this.app.emulateMobile(true), restored with false. Use actual devices as well. Android USB debugging exposes the WebView at chrome://inspect/ on a desktop Chromium browser. Apple mobile inspection needs a Mac and Web Inspector; follow the linked WebKit instructions. Do not treat an emulated viewport as OS certification.

For development use a dedicated vault, as advised by [Build a plugin](https://docs.obsidian.md/Plugins/Getting%20started/Build%20a%20plugin). Restart after manifest changes. Capture error text and reproducible actions without private notes.

## Release gate

Complete TEST-RESULTS-TEMPLATE.md. Confirm downloaded bytes, green CI jobs, no startup/data-loss errors and correct history. Verify the minimum supported app version or raise it in a new prepared build if it cannot be supported. Hosted Community review is a separate gate and may request changes. No automatic test here guarantees Community acceptance.
