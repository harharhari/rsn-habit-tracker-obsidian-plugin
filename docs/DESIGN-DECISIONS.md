# Version 1.1.7 questions and final design

## Confirmed answers

1. Hide the specified entries in Obsidian's file explorer while keeping Details access? **User: Yes, hide only those tracker entries.**
2. Keep Search habits on the main page? **User: Yes.**
3. Which month should Details Statistics use? **User: The displayed month.**

## Additional questions and chosen defaults

4. Should hiding change data paths or sync? No. CSS hides the five exact explorer entries only. All stored paths and sync behavior remain unchanged.
5. Should similarly named folders elsewhere be hidden? No. The selector includes the file-explorer scope and full exact vault path.
6. What restores visibility? Disabling the plugin removes its stylesheet. Details already offers access while enabled. This is not a privacy or access-control feature.
7. What does Apply habit list do when Details shows an older month? It applies to the actual current month only, with the existing Yes/No confirmation. The page explains that distinction.
8. Where should Back to calendars return? The displayed month saved in Details, including after workspace restoration.
9. Should archive verification remain on the main page? No. Previous-month Details has Verify saved snapshot; the existing archive command also remains.
10. What happens to existing records on upgrade? No migration or deletion. Replace the three plugin files and preserve data.json plus all Habit Tracker content.
11. What if an Obsidian/theme update changes explorer markup? Hiding may stop matching. The data stays intact. Verify the sidebar in native acceptance tests.

## Final design

Main page: Previous, Choose month, Next, Details, Search habits, calendar grids and existing totals/help. Date cells remain interactive as before. Details: Back to calendars, Refresh details, Habit list, Color reference, Apply habit list and Statistics, plus tracker-folder/file access and historical snapshot verification. Months remains visible in the explorer. The five requested internal paths are hidden there, while Details remains the route to maintenance.

The existing habit editor, custom color support, reset approval and frozen history are unchanged. File explorer hiding uses plugin CSS with exact paths, without private Obsidian APIs, DOM observers or file mutations. Native device acceptance is still required. See navigation.drawio for the editable navigation diagram.
