# Version 1.1.8 design questions and decisions

This release preserves the previously confirmed UI preferences. No new preference was needed to resolve the reported CSS warning.

1. Should the five tracker entries remain hidden? Yes; preserve the user's confirmed 1.1.7 behavior.
2. Should :has be removed entirely? Yes, from the distributed stylesheet, with a release-time regression guard.
3. Can the fix remain CSS-only? Yes. Match exact title paths and following folder-child containers directly.
4. Should a DOM observer or polling loop replace :has? No; neither is needed for this design.
5. What about expanded folders and dynamically synced entries? CSS applies automatically to inserted matching titles and children. The scoped display rule overrides inline display:block on expanded children.
6. Should similarly named folders elsewhere be affected? No. Full vault paths and the file-explorer scope restrict matching.
7. Should hiding alter sync, backups or file locations? No. Preserve all files and paths; use Details for maintenance.
8. How is normal visibility restored? Disable the plugin so Obsidian unloads its stylesheet. Hiding is not a privacy feature.
9. What if app/theme markup changes? Entries may become visible. Native acceptance must verify actual markup on each supported platform. Data remains intact.
10. Should the toolbar, habit editor or statistics logic change? No. Keep Previous, Choose month, Next, Details and Search habits. Details retains the displayed month for Statistics; applying the list targets the current month with Yes/No approval.

The final design replaces only the sidebar CSS strategy, updates version metadata to 1.1.8, and adds checks and documentation. No runtime data migration is required. The editable navigation diagram remains navigation.drawio.
