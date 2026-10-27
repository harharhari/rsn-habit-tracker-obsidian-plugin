# Version 1.1.8

Fix the Community CSS lint observation about relational :has selectors. The stylesheet now matches the five exact file-explorer title paths directly. For Records, Statistics and System it also hides the following nav-folder-children container using a sibling selector. Expanded children cannot appear even when their container has an inline display:block style. The narrowly scoped display rule uses !important for that reason.

No ancestor matching, JavaScript DOM observer, polling or file mutation is needed. A release check rejects any :has( selector in styles.css. Browser tests cover expanded children, newly inserted rows, renamed paths, unrelated folders, zero-height hidden entries and restoration after removing plugin CSS.

The four main buttons, Search habits, Details actions and displayed-month statistics remain unchanged. Files stay in place and continue syncing. Keep all hidden files in backups. This is visual simplification, not access control.

Upgrade from 1.1.7 by replacing only main.js, manifest.json and styles.css. Preserve data.json and the entire Habit Tracker folder. No ID or data-schema migration is required. Native Obsidian/theme checks and hosted review remain pending; see VALIDATION.md.
