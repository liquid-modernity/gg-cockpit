Release 0.2A dry-run sync is now clean and confirmed in Google Apps Script.

Latest dry-run result:
- scannedCells = 2200
- workflowMappedCells = 8
- cellStateMappedCells = 2192
- unknownCells = 0
- unknownColors = {}

Workflow mapped cells are D2:D9 with #ffff00 = DRAFT_IN_PROGRESS.
#000000 is N/A.
#ffffff is BLANK.

Now implement Release 0.2B: actual TASK_SNAPSHOT and CHANGE_LOG write.

Read:
- AGENTS.md
- docs/SOURCE_OF_TRUTH.md
- docs/SHEET_CONTRACT.md
- docs/PRD.md
- docs/COCKPIT_PHILOSOPHY.md
- apps-script/config.gs
- apps-script/bootstrap.gs
- apps-script/registry.gs
- apps-script/sync.gs
- apps-script/Code.gs

Do not change the dashboard surface.
Do not deploy anything.
Do not add GitHub Actions for Apps Script deployment yet.
Do not make the dashboard read directly from Sheet 1.
Do not hardcode spreadsheet IDs outside config.gs.

Scope:

1. Implement syncCockpitColorsToDatabase().

2. Keep syncCockpitColorsToDatabaseDryRun() read-only.

3. Refactor scanner/classifier into a shared internal function so dry-run and actual sync use the same scan result.

4. Keep backward compatibility:
   - syncCockpitColorsToDatabase() should be the primary function.
   - syncColorsToDatabase() may remain as an alias if Code.gs menu still references it.
   - Update Code.gs menu label/function only if needed.

5. Update bootstrap schema for 07_TASK_SNAPSHOT and 08_CHANGE_LOG by adding missing headers only.
   Do not clear existing sheets.
   Do not delete existing data.
   Do not reorder filled sheet data destructively.

6. 07_TASK_SNAPSHOT should include at minimum:
   - snapshot_id
   - sheet_name
   - cell_a1
   - project_code_or_column_header
   - row_number
   - column_number
   - cell_value
   - hex_color
   - status_code
   - status_label
   - responsible_role
   - last_seen_at
   - source_spreadsheet_id
   - source_sheet_name
   - source_range_a1
   - active

7. 08_CHANGE_LOG should include at minimum:
   - change_id
   - changed_at
   - sheet_name
   - cell_a1
   - previous_status_code
   - new_status_code
   - previous_hex_color
   - new_hex_color
   - cell_value
   - responsible_role
   - change_type
   - source_spreadsheet_id
   - sync_run_id

8. Actual sync must write only workflow mapped cells to 07_TASK_SNAPSHOT.
   Do not write BLANK cell states.
   Do not write N/A cell states.

9. Actual sync must compare current workflow state against existing 07_TASK_SNAPSHOT.

10. Actual sync must append only changed workflow cells to 08_CHANGE_LOG.

11. CHANGE_LOG must be append-only.
    Never clear existing logs.

12. 07_TASK_SNAPSHOT must be upserted by a stable cell key for Release 0.2B.
    Use a deterministic snapshot_id based on source spreadsheet, sheet name, and cell A1.
    Add a TODO that later releases should replace A1-based identity with Developer Metadata / Sheet Layout Registry.

13. Repeated sync without Sheet 1 changes must not duplicate snapshot rows.

14. Repeated sync without Sheet 1 changes must append 0 new CHANGE_LOG rows.

15. Unknown colors must block actual sync by default.

16. Add config:
    BLOCK_SYNC_ON_UNKNOWN_COLORS = true

17. If unknown colors exist, actual sync must stop with a clear error message and must not write TASK_SNAPSHOT or CHANGE_LOG.

18. For now, project_code_or_column_header may be derived from the column header in row 1 of the watched range.

19. Add Logger output for:
    - syncRunId
    - sync summary
    - inserted snapshot count
    - updated snapshot count
    - unchanged snapshot count
    - change log append count
    - skipped cell state count
    - unknown color count

20. After changes, run npm run qa.

Output:
- files changed
- exact Apps Script files to paste
- first manual test
- expected TASK_SNAPSHOT columns
- expected CHANGE_LOG columns
- rollback instruction if sync writes wrong data