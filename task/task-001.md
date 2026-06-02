Read AGENTS.md, docs/PRD.md, docs/SOURCE_OF_TRUTH.md, docs/FRONTEND_CONTRACT.md, docs/SHEET_CONTRACT.md, docs/COCKPIT_PHILOSOPHY.md, docs/MIGRATION_FROM_V081.md, and docs/PRODUCTION_READINESS_CHECKLIST.md.

Context update:

I have created two real Google Spreadsheets:

Sheet 1 / operational cockpit / fallback:
Name: Gaga Cockpit Web
Spreadsheet ID: 15kYRb_2GVMvlvhVEpc-OEd98OmWbnOzoIwDX84-JJ3Q

Sheet 2 / system database:
Name: Gaga Cockpit Database
Spreadsheet ID: 1wUZinkzQKN4FZ-dmzuERHrSTRRssH_I5cm3Qvsmgm8k

Do not treat the dashboard as the source of truth.

The architecture must remain:
Google Sheet 1 = shared operational cockpit and fallback.
Google Sheet 2 = system database, registry, snapshot, log, users, workflow, KPI.
Apps Script = sync engine.
Cloudflare Worker = API/auth/cache/webhook layer.
Cockpit Dashboard = curated surface only.

Task:

Audit the current migrated cockpit surface and then prepare Release 0.2 implementation plan and source changes for real Sheet 2 bootstrap + Apps Script sync foundation.

Scope for Release 0.2A:

1. Add or update Apps Script configuration so the code can reference:
   - COCKPIT_SPREADSHEET_ID = 15kYRb_2GVMvlvhVEpc-OEd98OmWbnOzoIwDX84-JJ3Q
   - DATABASE_SPREADSHEET_ID = 1wUZinkzQKN4FZ-dmzuERHrSTRRssH_I5cm3Qvsmgm8k

2. Do not hardcode these IDs in random files.
   Put them in one config location only:
   - Apps Script script properties, or
   - apps-script/config.js, with clear comments for later Script Properties migration.

3. Implement a Sheet 2 bootstrap function that creates/validates headers for these tabs:
   - 01_USERS
   - 02_PROJECTS
   - 03_TASK_TEMPLATES
   - 04_WORKFLOW_COLORS
   - 05_ROLE_ROUTING
   - 06_SHEET_LAYOUT_REGISTRY
   - 07_TASK_SNAPSHOT
   - 08_CHANGE_LOG
   - 09_PERFORMANCE_LOG
   - 10_SYSTEM_CONFIG

4. The bootstrap function must not destroy existing data.
   It may create missing headers.
   It may append default registry rows only when the sheet is empty.
   It must not clear filled sheets.

5. Add a function:
   bootstrapGagaCockpitDatabase()

6. Add a function:
   validateGagaCockpitDatabase()

7. Add a function:
   syncCockpitColorsToDatabaseDryRun()

8. The dry-run sync should:
   - open Sheet 1 by ID;
   - read a configurable watched range;
   - read cell values and backgrounds;
   - normalize background hex;
   - map color using 04_WORKFLOW_COLORS;
   - produce a preview object/log;
   - not write TASK_SNAPSHOT yet.

9. Add a later TODO for actual sync:
   - compare against 07_TASK_SNAPSHOT;
   - append to 08_CHANGE_LOG;
   - update TASK_SNAPSHOT;
   - optionally write SYSTEM_ALERTS / Discord alert for unknown colors.

10. Keep the migrated v081 cockpit surface modular.
    Do not reintroduce monolithic HTML.
    Do not use arbitrary innerHTML.
    Do not make the dashboard read directly from Sheet 1.

11. My local Mac cannot run Playwright or Wrangler.
    Do not ask me to run Playwright locally.
    Use npm run qa for local validation.
    Assume Playwright and Wrangler must run through GitHub Actions.

12. After changes, run:
    npm run qa

Output:
- summarize files changed;
- explain exactly what I should paste into Google Apps Script;
- explain the first manual test I should run inside Google Sheets;
- do not deploy anything yet.
