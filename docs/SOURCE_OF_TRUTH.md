# SOURCE_OF_TRUTH.md

## Source of Truth Matrix

| Entity | Source of Truth | Notes |
|---|---|---|
| Human operational status | Google Sheet 1 cell color | Fast fallback workflow |
| Machine-readable status | Google Sheet 2 TASK_SNAPSHOT | Derived from Sheet 1 |
| User registry | Google Sheet 2 USERS | Email, role, access, PIN hash, Discord ID |
| Workflow colors | Google Sheet 2 WORKFLOW_COLORS | Color → status → role |
| Project registry | Google Sheet 2 PROJECTS | Project metadata |
| Task templates | Google Sheet 2 TASK_TEMPLATES | Reusable task rows |
| Logs | Google Sheet 2 CHANGE_LOG / PERFORMANCE_LOG | Append-only |
| Dashboard UI | Repo source + registry | View only |
| Discord | No source of truth | Notification only |
| Exported HTML | No source of truth | Artifact/reference only |

## Non-Negotiable Rules

1. Dashboard is not the source of truth.
2. Discord is not the source of truth.
3. HTML export is not the source of truth.
4. Google Sheet export CSS classes are not data contracts.
5. Sheet 1 must remain usable when the dashboard fails.
6. Sheet 2 must remain protected from normal production users.
7. Logs are append-only.
8. Delete means archive unless explicitly stated otherwise.

## Sheet 1

Sheet 1 is for human work:
- colors;
- links;
- client columns;
- task rows;
- fallback operation.

Sheet 1 may be messy because it is an operational cockpit.

## Sheet 2

Sheet 2 is for machines:
- registry;
- users;
- routes;
- snapshots;
- logs;
- KPI;
- system config.

Sheet 2 must be structured, protected, and auditable.
