# rsn habit calendar one b 1.1.4

Repairs the shared npm dependency installation failure affecting Ubuntu, Windows and macOS builds. The public-registry lockfile resolves which-typed-array to available version 1.1.24. A dependency-free preflight identifies the exact commit and lockfile before installation and rejects the known broken resolution. Three new regression tests cover valid, broken and stale lockfiles.

The CI matrix now runs Python helper/installer tests on all three operating systems as well as lint, production build, JavaScript tests and release checks. Windows installs timezone data for the optional helper tests. Updated installation, submission, troubleshooting and tutorial files accompany the release.

The plugin ID remains rsn-habit-calendar-one-b, display name remains rsn habit calendar one b, author harharhari and license GPL-3.0-only. No tracking format or calendar behavior changes are needed for this build repair. Preserve data.json and the entire Habit Tracker folder. From 1.1.3 replace program files in the same plugin folder; from the old habit-calendar-001b identity follow MIGRATION-1.1.3.md first.

See VALIDATION.md for executed checks and pending native/device validation. The ESLint deprecation warning remains nonfatal. Attach the six release files individually to tag 1.1.4.
