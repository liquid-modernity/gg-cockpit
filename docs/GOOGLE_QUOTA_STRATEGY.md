# GOOGLE_QUOTA_STRATEGY.md

## Principle

Do not treat Google Sheets as a high-frequency database.

Use it as:
- operational cockpit;
- system registry;
- structured log;
- source for periodic sync.

Use Cloudflare cache/API to protect the dashboard from over-reading Sheets.

## Rules

1. Do not read full spreadsheet on every dashboard request.
2. Do not scan entire Sheet 1 every few seconds.
3. Do not write logs one-by-one if batching is possible.
4. Do not use one Apps Script call per task card.
5. Cache registry and snapshot data.
6. Use exponential backoff for Google API errors.
7. Treat 429 as expected failure mode.

## Recommended Read Pattern

```text
Apps Script sync
→ writes Sheet 2 snapshot/log

Worker scheduled/cache refresh
→ reads Sheet 2 structured range

Dashboard
→ reads Worker API/cache
```

## Suggested Intervals

```text
MVP dashboard refresh: 30 seconds
Registry cache TTL: 5 minutes
Full rebuild: manual/admin only
Heavy validation: scheduled/off-hours
```

## Critical Warning

If dashboard directly reads Google Sheet 1 for every user, the system will become slow and fragile as client volume grows.
