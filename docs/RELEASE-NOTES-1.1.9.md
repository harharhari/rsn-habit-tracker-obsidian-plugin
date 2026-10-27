# Version 1.1.9

Version 1.1.9 removes both :has selectors and !important declarations from the distributed stylesheet. Exact-path title and following-child selectors use display:none plus visibility:hidden, max-height:0, overflow:hidden and zero spacing. The extra collapse properties handle expanded child containers with inline display:block without overriding that inline declaration. No observer, polling, file moves or data migration are introduced. Native app/theme acceptance remains required.

Release preparation now compares the tag checkout, the current default-branch manifest and the generated manifest before attestation. After creating the draft it downloads the attached manifest and compares again. Audit published manifest repeats this check after publication or on manual dispatch. All manifest fields must match and version must equal 1.1.9. These checks detect mismatches; they do not rewrite GitHub files automatically.

Upgrade by replacing main.js, manifest.json and styles.css together. Preserve data.json and the complete Habit Tracker folder. The four main buttons, Search habits, Details actions, editor, frozen history and displayed-month statistics remain unchanged.
