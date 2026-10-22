# Final release design and additional questions

## Confirmed design

One cross-platform community plugin, ID habit-calendar-001b, version 1.1.1, author harharhari, GPL-3.0-only. One monthly page with a named calendar for each enabled habit. Six columns on wide desktop views and one on mobile. Monday starts the week. Manual taps cycle blank, green, pink. No schedules. Earlier current-month dates remain editable; future dates and historical months are locked.

The editable habit table has Habit, Generate calendar and Header color. A separate editable reference has 147 CSS3 colors and rendered shades. Current list changes require Yes/No. Yes replaces the full current catalog and clears all its marks. No leaves active data unchanged and retains the edited list for later application/new months. Past calendars and statistics use frozen snapshots, including after late sync. Statistics and System must survive any manual historical cleanup.

Data lives in the vault. No plugin network service is required. Existing plugin data.json and Habit Tracker are preserved during upgrades. The release has four loose assets, a convenience ZIP and an installation checksum file. Source and documentation are committed separately. Repository-root checksums cover the prepared source snapshot. The runtime is unchanged from the working 1.1.1.

## Questions and decisions

These questions improve publication and future design. Pending answers do not change the working runtime. Defaults are explicit, not treated as user consent.

| Question | Current answer or provisional choice | Effect |
|---|---|---|
| Include the personal 71-habit list publicly? | Confirmed: generic examples only; personal list private | Prevents publishing the user's private habit catalog |
| Which sync method should tutorials teach? | Confirmed: manual installation plus optional Obsidian Sync | Both offline users and Sync subscribers can install |
| Exact Ubuntu/Android/app versions that worked? | Ubuntu 24.04.3 confirmed; Obsidian/Android assumed latest by user, exact versions unrecorded | Needed for the compatibility matrix |
| Keep public name Habit Calendar 001b? | Retain existing requested name and ID | Avoids migration and reinstall |
| Which timezone should new users use? | Existing default Asia/Kolkata, editable in System/config.md | Day/month boundaries must agree on all devices |
| Should a future list edit preserve marks for unchanged habits? | Current explicit requirement remains full reset on Yes | Any preservation change needs a new design/version |
| Must calendars appear while the app is closed? | Existing app-open behaviour plus optional Linux helper | Android has no background scheduler |
| What is the minimum supported app version? | Declared 1.7.2; real-device minimum test pending | Maintainer must validate or revise before claiming tested support |
| Who will handle support and bug reports? | Public author harharhari; GitHub Issues proposed | No personal email is published |
| Which additional platforms can be advertised as tested? | Ubuntu/Android user-reported only | Windows/macOS/iOS remain unverified |
| Is the public tutorial based on real phone screenshots? | Browser-rendered examples only, explicitly labeled | No fabricated device evidence |
| Automatic GitHub publishing or manual releases? | Manual releases with existing CI validation | Maintainer controls publication and visibility |

## Combined design

The public distribution contains only program source, generic examples and documentation. Users obtain the same runtime through six GitHub release attachments or the three standard Community installer assets. The tutorial starts with a disposable rsn-test-vault, teaches manual Ubuntu/Android installation, then optional sync, daily marking, destructive list changes, history and upgrades. Documentation separates user-reported device success, automated tests and hosted acceptance. Only the maintainer publishes to GitHub and submits after reviewing test outcomes. Open questions are recorded above for refinement without delaying the usable release package.
