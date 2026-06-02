0.2B actual sync did not write anything.

Confirmed:
- syncCockpitColorsToDatabaseDryRun() works.
- Dry-run shows workflowMappedCells = 8 and unknownCells = 0.
- I ran syncColorsToDatabase from the Apps Script dropdown.
- 07_TASK_SNAPSHOT remains empty.
- 08_CHANGE_LOG remains empty.

Do not change dashboard.
Do not change dry-run classification.
Do not deploy Web App.
Do not implement unrelated features.

Patch only actual sync wiring and write verification.

Scope:

1. Inspect apps-script/sync.js.

2. Ensure these top-level Apps Script functions exist:
   - syncCockpitColorsToDatabaseDryRun()
   - syncCockpitColorsToDatabase()
   - syncColorsToDatabase()

3. syncCockpitColorsToDatabaseDryRun() must call the shared sync core with dryRun: true.

4. syncCockpitColorsToDatabase() must call the shared sync core with dryRun: false.

5. syncColorsToDatabase() must be a backward-compatible alias for syncCockpitColorsToDatabase(), not dry-run.

6. Add explicit Logger output at the start of actual sync:
   "GAGA actual sync started"

7. Add explicit Logger output before writing:
   - workflowMappedCells count
   - target snapshot sheet name
   - target change log sheet name
   - dryRun false

8. Add explicit Logger output after writing:
   - insertedSnapshotCount
   - updatedSnapshotCount
   - unchangedSnapshotCount
   - changeLogAppendCount

9. If workflowMappedCells > 0 but insertedSnapshotCount + updatedSnapshotCount + unchangedSnapshotCount = 0, throw an error.
   Message:
   "Actual sync saw workflow cells but wrote no snapshot rows."

10. If dryRun is false, the function must write to:
   - 07_TASK_SNAPSHOT
   - 08_CHANGE_LOG

11. Add or update a manual test helper:
   debugSyncFunctionRouting()
   It should return/log which top-level function calls dry-run and which calls actual sync.

12. Keep unknown-color blocking.

13. Run:
   npm run qa
   node --check apps-script/*.js
   clasp status

Output:
- files changed
- exact function I should run in Apps Script
- expected logs for actual sync first run
- expected logs for actual sync second run