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

## No Silent Failure

No failed sync, webhook, auth, or write-back operation should fail silently.
