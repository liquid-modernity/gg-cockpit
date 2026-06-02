# OBSERVABILITY.md

## Observability Goals

The system must expose enough operational signals to answer:

- Is sync running?
- What changed?
- Who changed it?
- Did Discord notification send?
- Are unknown colors present?
- Is dashboard delayed?
- Did deploy succeed?
- Is fallback required?

## Required Logs

Sheet 2 logs:

```text
CHANGE_LOG
PERFORMANCE_LOG
SYSTEM_ALERTS
AUTH_LOG
WEBHOOK_LOG
```

## Sync Performance Log

`09_PERFORMANCE_LOG` records one row for each actual Apps Script sync run.

Expected fields include:

```text
sync_run_id
mode
started_at
ended_at
duration_ms
status
sheet_name
watched_range_a1
scanned_cells
workflow_mapped_cells
cell_state_mapped_cells
unknown_cells
inserted_snapshot_count
updated_snapshot_count
unchanged_snapshot_count
change_log_append_count
skipped_cell_state_count
error_message
source_spreadsheet_id
database_spreadsheet_id
```

Expected counts for a healthy repeated sync:

```text
workflow_mapped_cells > 0
unknown_cells = 0
inserted_snapshot_count = 0 after the first successful run
updated_snapshot_count = 0 when Sheet 1 did not change
unchanged_snapshot_count = workflow_mapped_cells when Sheet 1 did not change
change_log_append_count = 0 when Sheet 1 did not change
status = success
```

## Sync Drift Detection

Possible drift signals:

```text
workflow_mapped_cells does not match active 07_TASK_SNAPSHOT rows
unknown_cells > 0
updated_snapshot_count spikes unexpectedly
change_log_append_count spikes unexpectedly
duration_ms rises sharply
status = failed
```

When drift is suspected:
1. Compare the latest `09_PERFORMANCE_LOG` row with the previous successful run.
2. Inspect `08_CHANGE_LOG` for the same `sync_run_id`.
3. Inspect `11_SNAPSHOT_BACKUP` for the previous snapshot captured before mutation.
4. Run dry-run sync before running actual sync again.

Unknown colors should block actual sync when `BLOCK_SYNC_ON_UNKNOWN_COLORS = true`.
The failed run should still appear in `09_PERFORMANCE_LOG`, but it should not write
`07_TASK_SNAPSHOT`, `08_CHANGE_LOG`, or `11_SNAPSHOT_BACKUP`.

## Required Alerts

Discord admin alerts:

```text
unknown color detected
sync failed
snapshot mismatch
webhook failed
production deploy failed
production smoke test failed
unauthorized access spike
```

## Dashboard Health States

The dashboard must be able to show:

```text
loading
loaded
empty
unauthorized
sync delayed
api error
fallback mode
```

## Minimum Health Endpoint

Worker should expose:

```text
GET /api/health
```

Response example:

```json
{
  "ok": true,
  "version": "0.1.0",
  "environment": "staging",
  "cache": "ok",
  "sheet2": "ok",
  "lastSyncAt": "2026-06-02T10:00:00Z"
}
```

## Release 0.3A Read API

The Worker read API proxies Apps Script read actions:

```text
GET /api/health
GET /api/tasks
GET /api/change-log/summary
GET /api/performance/summary
```

Expected client response shape:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {
    "source": "apps-script",
    "generatedAt": "2026-06-03T00:00:00.000Z",
    "requestId": "..."
  }
}
```

Operational checks:
- `/api/health` should return `ok: true` when Worker and Apps Script token setup are correct.
- `/api/tasks` should return active `07_TASK_SNAPSHOT` workflow rows.
- `/api/change-log/summary` should return counts and latest sync identity only, not full log rows.
- `/api/performance/summary` should show latest sync status and duration.
- A Worker `502` with generic upstream auth text usually means the Worker token and Apps Script Script Property do not match.
- A Worker `503` usually means Worker runtime secrets are missing.
- A Worker `504` means Apps Script read timed out.

## No Silent Failure

No failed sync, webhook, auth, or write-back operation should fail silently.
