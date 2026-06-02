# ARCHITECTURE.md

## System Overview

The system is a lightweight operating layer for AR/SR project production.

```text
Google Sheet 1
= operational cockpit + human fallback

Google Sheet 2
= system database + registry + snapshot + log + KPI

Google Apps Script
= sync engine between Sheet 1 and Sheet 2

Cloudflare Worker
= API, auth, routing, webhook, cache

Cloudflare Pages
= dashboard hosting

Dashboard
= filtered UI, not source of truth

Discord
= notification + collaboration layer
```

## Data Flow A: Sheet 1 to Dashboard

```text
User changes cell color in Google Sheet 1
→ Apps Script scans watched ranges
→ Apps Script compares current color against Sheet 2 TASK_SNAPSHOT
→ changed task is logged in CHANGE_LOG
→ workflow registry maps color to status/role
→ optional Discord webhook is triggered
→ Cloudflare Worker cache is refreshed or invalidated
→ dashboard receives updated task data
```

## Data Flow B: Dashboard to Sheet 1

```text
User clicks status action in Dashboard
→ Cloudflare Worker validates session and permission
→ Apps Script endpoint updates the target cell color in Sheet 1
→ Sheet 2 snapshot/log is updated
→ Discord notification is sent
→ dashboard state is refreshed
```

## Critical Design Choice

Sheet 1 remains the operational fallback.  
Sheet 2 is the machine-readable database.

The dashboard must always write back to Sheet 1 when changing operational task state.

## Why This Architecture

The team needs a fast, color-first spreadsheet workflow.
The system needs logs, permissions, KPI, routing, and automation.
This architecture keeps both needs alive without forcing the team into a bloated PM SaaS.
