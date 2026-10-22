# Habit Calendar 001b 1.1.1

Fix a startup/record-creation compatibility problem in WebViews where crypto.randomUUID is unavailable. Event and backup IDs now use crypto.getRandomValues to create standard UUID v4 identifiers. No weak random fallback or desktop-only dependency is used. Existing data and plugin ID remain compatible.

This addresses a plausible cause of the reported missing Android calendars and controls; the exact phone failure has not been confirmed by a device log. The mobile layout remains one calendar per row with 44-pixel day buttons; desktop remains six columns on wide views.

Validation: official Obsidian lint/metadata checks, production build, 37 JavaScript tests, six Python tests, and two Chromium browser scenarios passed. Browser scenarios disable randomUUID and check 60 calendars, desktop/mobility layout, touch/mouse marking, search, and persistence across panel recreation. Android app acceptance remains pending because the available emulator cannot boot online.

Upgrade instructions: ANDROID-rsn-test-vault.md. Install matching 1.1.1 assets on all devices. Back up your vault first; do not delete Habit Tracker or plugin data.json.

Maintainer update, 21 October 2026: reported working on Ubuntu 24.04.3 and Android phones. Obsidian/Android are assumed latest by the user; exact app/phone versions and full checklist outcomes remain unrecorded. The earlier emulator attempt remains blocked, separate from this phone report. The publication package adds installation guidance and a PowerPoint tutorial without changing runtime assets.
