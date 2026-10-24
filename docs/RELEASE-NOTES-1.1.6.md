# Version 1.1.6

The calendar remains the main workspace. Its toolbar now includes Details, opening a separate page for Months, Records, Statistics, System and the two editable reference files. No Welcome page is generated or opened. Obsidian's global file explorer and existing notes are unchanged.

Habit list opens a dedicated editor backed by habit-tracker-list.md. Generate calendar uses a Y/N dropdown. Header color supports a searchable chooser with color name, hex code and actual swatch, plus direct #RRGGBB input. The chooser reads the vault color reference, including custom entries. Native select options cannot reliably display swatches across platforms, so Choose color opens an accessible searchable dialog.

Save validates the entire list, preserves existing habit IDs and surrounding Markdown, and refuses to overwrite a file changed since loading. Saving a meaningful change immediately offers the existing current-month Yes/No replacement confirmation. Yes clears all current-month marks. No retains current calendars while leaving the edited list saved. Previous months remain frozen.

Invalid or blank header colors now block processing rather than silently receiving a default. Correct older invalid values through Open Markdown file, then Reload editor. Valid custom colors require exactly six hex digits after #. No data-schema or plugin-ID migration is required from 1.1.5.

Community release assets: main.js, manifest.json, styles.css. See VALIDATION.md for executed checks and pending native device tests.
