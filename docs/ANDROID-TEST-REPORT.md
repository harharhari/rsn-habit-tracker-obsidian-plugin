> Historical Android investigation. For 1.1.2 evidence and pending device acceptance, see VALIDATION.md and PLATFORM-TESTING.md.

# Android emulator test attempt — 20 October 2026

**Result: BLOCKED. No Android plugin tests passed or failed; the app could not be reached.**

- Android SDK available at <Android SDK directory>.
- Emulator version 36.1.9.0, AVD Medium_Phone_API_36.0, Android API 36 Google Play x86_64 image.
- Hardware-accelerated launch failed: `/dev/kvm is not found: VT disabled in BIOS or KVM kernel module not loaded`.
- `emulator -accel-check` returned status 8 with the same diagnostic.
- Software launch with `-accel off -no-snapshot -no-window -no-audio -gpu swiftshader_indirect` started, but repeated ADB checks reported emulator-5554 offline. Obsidian installation, plugin launch, rendered UI and interaction testing were not possible during this attempt.
- No personal phone or real vault was modified. No plugin code or release bytes changed.

## Next prerequisite

Provide a working Android emulator with KVM acceleration (or a connected Android test device with USB debugging). Follow Google's Linux acceleration guide: https://developer.android.com/studio/run/emulator-acceleration#vm-linux . The diagnostic does not distinguish disabled firmware virtualization from an unavailable kernel module or host/VM device passthrough. System/firmware changes were not attempted.

Once ADB shows an online device, install the official Obsidian Android app, create a disposable rsn-test-vault, install the verified 001b release, and execute the phone checklist in ANDROID-rsn-test-vault.md. Real Sync tests additionally require the user's configured remote test vault.

The previous 41 Node/Python tests remain useful regression evidence, but they are not Android emulator results.

## 1.1.1 follow-up

The production bundle now passes 37 JavaScript and six Python tests, plus desktop/mouse and mobile/touch Chromium scenarios with randomUUID absent. These exercise mocked Obsidian APIs, not the Android application. The emulator blocker above still prevents Android app verification. The prior statement that no release bytes changed applies only to the earlier emulator attempt; this follow-up produced version 1.1.1.
