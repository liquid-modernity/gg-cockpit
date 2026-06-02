Release 0.2A dry-run sync works, but color classification needs correction.

The dry-run result shows:

#000000 = 110 cells
#ffffff = 2082 cells

These are not unknown colors.

Business meaning:
- #000000 = N/A
- #ffffff = BLANK

Do not treat #000000 and #ffffff as workflow handoff statuses.
Do not add them to 04_WORKFLOW_COLORS as normal workflow statuses.

Patch Release 0.2A classification so the system separates:

1. workflow colors
   - read from 04_WORKFLOW_COLORS
   - used for task/workflow handoff

2. cell state colors
   - #000000 = N/A
   - #ffffff = BLANK
   - known but non-workflow

Scope:

1. Add a single config location for known non-workflow cell states.

For now use config.gs, for example:

CELL_STATE_COLORS = {
  '#000000': {
    stateCode: 'N_A',
    stateLabel: 'N/A',
    includeInWorkflow: false,
    includeInSnapshot: false
  },
  '#ffffff': {
    stateCode: 'BLANK',
    stateLabel: 'Blank',
    includeInWorkflow: false,
    includeInSnapshot: false
  }
}

2. Keep 04_WORKFLOW_COLORS only for workflow handoff colors.

3. Update syncCockpitColorsToDatabaseDryRun() summary so it separates:
- scannedCells
- workflowMappedCells
- cellStateMappedCells
- unknownCells
- workflowColors
- cellStateColors
- unknownColors

4. Update preview output:
- first 25 workflow mapped cells
- first 25 unknown cells
- first 25 cell state cells only if debug mode is enabled

5. Add config:
DRY_RUN_PREVIEW_LIMIT = 25
DRY_RUN_INCLUDE_CELL_STATE_PREVIEW = false

6. If a cell is #000000, classify it as:
stateCode: N_A
stateLabel: N/A
knownColor: true
workflowColor: false

7. If a cell is #ffffff, classify it as:
stateCode: BLANK
stateLabel: Blank
knownColor: true
workflowColor: false

8. Unknown colors should only contain colors that are neither:
- in 04_WORKFLOW_COLORS
- nor in CELL_STATE_COLORS

9. Keep dry-run read-only.
Do not write to TASK_SNAPSHOT.
Do not write to CHANGE_LOG.

10. Add Logger output:
- dry-run summary
- workflow mapped sample
- unknown sample
- cell state summary

11. Run npm run qa.

Output:
- files changed
- exact Apps Script files to paste
- manual test steps
- expected new log shape