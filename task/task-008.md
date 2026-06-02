Release 0.2B is accepted.

Current confirmed state:
- Dry-run is clean.
- Actual sync writes 8 rows to 07_TASK_SNAPSHOT.
- Actual sync writes 8 rows to 08_CHANGE_LOG on first run.
- Second actual sync without Sheet 1 changes is idempotent:
  07_TASK_SNAPSHOT remains 8 rows.
  08_CHANGE_LOG remains 8 rows.
- Apps Script source is standardized to apps-script/*.js only.
- .clasp.json is ignored and generated from GitHub Secrets for CI.
- deploy-clasp.yml is hardened.
- npm run qa passes.

Now implement Release 0.2D:
sync reliability, backup, and audit hardening.

Do not change dashboard.
Do not implement Worker API.
Do not deploy Web App.
Do not change the core color classification logic unless needed for reliability.
Do not reintroduce .gs files.
Do not make dashboard read directly from Sheet 1.

Read:
- AGENTS.md
- docs/SOURCE_OF_TRUTH.md
- docs/SHEET_CONTRACT.md
- docs/PRD.md
- docs/COCKPIT_PHILOSOPHY.md
- docs/BACKUP_RECOVERY.md
- docs/OBSERVABILITY.md
- docs/DEPLOYMENT_RUNBOOK.md
- apps-script/config.js
- apps-script/bootstrap.js
- apps-script/registry.js
- apps-script/sync.js
- apps-script/Code.js

Scope:

1. Add sync lock protection.

Use Apps Script LockService to prevent two sync runs from writing at the same time.

Add config:
SYNC_LOCK_TIMEOUT_MS = 30000

Actual sync must:
- acquire lock before writing;
- release lock in finally;
- fail clearly if lock cannot be acquired.

Dry-run may run without write lock, unless you think shared code requires it.

2. Add 09_PERFORMANCE_LOG run logging.

Every actual sync should append one row to 09_PERFORMANCE_LOG.

Dry-run may also append only if config enables it.

Add config:
PERFORMANCE_LOG_ENABLED = true
DRY_RUN_PERFORMANCE_LOG_ENABLED = false

09_PERFORMANCE_LOG should include at minimum:
- sync_run_id
- mode
- started_at
- ended_at
- duration_ms
- status
- sheet_name
- watched_range_a1
- scanned_cells
- workflow_mapped_cells
- cell_state_mapped_cells
- unknown_cells
- inserted_snapshot_count
- updated_snapshot_count
- unchanged_snapshot_count
- change_log_append_count
- skipped_cell_state_count
- error_message
- source_spreadsheet_id
- database_spreadsheet_id

3. Add snapshot backup before actual mutation.

Before actual sync modifies 07_TASK_SNAPSHOT, create a lightweight backup of the current 07_TASK_SNAPSHOT.

Use a single controlled backup tab, not unlimited timestamp tabs.

Add/validate tab:
11_SNAPSHOT_BACKUP

11_SNAPSHOT_BACKUP should include at minimum:
- backup_id
- sync_run_id
- backed_up_at
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

Add config:
SNAPSHOT_BACKUP_ENABLED = true
SNAPSHOT_BACKUP_TAB_NAME = '11_SNAPSHOT_BACKUP'

If 07_TASK_SNAPSHOT is empty, backup should not fail. It may append 0 backup rows and continue.

4. Update bootstrap and validate.

bootstrapGagaCockpitDatabase() must create/validate:
- existing 10 tabs;
- plus 11_SNAPSHOT_BACKUP.

It must not clear existing data.
It must only add missing headers.
It must not reorder filled data destructively.

validateGagaCockpitDatabase() must include 11_SNAPSHOT_BACKUP.

5. Unknown color blocking must be auditable.

If actual sync sees unknown colors and BLOCK_SYNC_ON_UNKNOWN_COLORS = true:
- do not write 07_TASK_SNAPSHOT;
- do not write 08_CHANGE_LOG;
- do not write 11_SNAPSHOT_BACKUP;
- do append a failed run row to 09_PERFORMANCE_LOG, if enabled;
- throw a clear error.

6. Add sync summary helper.

Actual sync Logger output should include:
- syncRunId
- lock acquired
- preflight summary
- backup row count
- insertedSnapshotCount
- updatedSnapshotCount
- unchangedSnapshotCount
- changeLogAppendCount
- performance log append result
- final status

7. Add rollback helper documentation, not destructive rollback code.

Do not implement automatic rollback yet.

Update docs/BACKUP_RECOVERY.md with manual rollback steps:
- identify bad sync_run_id;
- inspect 08_CHANGE_LOG;
- inspect 11_SNAPSHOT_BACKUP for previous snapshot;
- restore 07_TASK_SNAPSHOT manually if needed;
- preserve bad 08_CHANGE_LOG rows as audit trail.

8. Add observability documentation.

Update docs/OBSERVABILITY.md:
- explain 09_PERFORMANCE_LOG;
- explain expected counts;
- explain how to detect sync drift;
- explain when unknownColors should block sync.

9. Update Code.js menu.

Add clear menu entries if needed:
- Bootstrap Database
- Validate Database
- Dry-run Color Sync
- Actual Color Sync
- Debug Sync Routing

Do not add risky destructive menu items.

10. Tests and validation.

Run:
- npm run qa
- node --check apps-script/*.js
- clasp status

Do not run clasp push unless I ask.

Output:
- files changed
- exact Apps Script files changed
- whether any new tab is added
- updated expected database tabs
- manual test sequence
- expected log after actual sync
- expected 09_PERFORMANCE_LOG row
- expected 11_SNAPSHOT_BACKUP behavior