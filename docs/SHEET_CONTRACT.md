# SHEET_CONTRACT.md

## Google Sheet 1: Operational Cockpit

Purpose:
- human editing;
- visual workflow;
- fallback when dashboard fails;
- color-first production tracking.

Allowed:
- color changes;
- link updates;
- task content updates;
- manual fallback work.

Avoid:
- random new colors;
- unregistered columns;
- unregistered rows;
- hard delete;
- breaking merged headers without sync.

## Google Sheet 2: System Database

Required tabs:

```text
01_USERS
02_PROJECTS
03_TASK_TEMPLATES
04_WORKFLOW_COLORS
05_ROLE_ROUTING
06_SHEET_LAYOUT_REGISTRY
07_TASK_SNAPSHOT
08_CHANGE_LOG
09_PERFORMANCE_LOG
10_SYSTEM_CONFIG
```

## Color Registry

Example:

```text
hex_color | status_code | label | responsible_role | notify | kpi_event
#ffff00  | DRAFT_IN_PROGRESS     | Draft in progress     | copywriter | no  | no
#00ff00  | READY_FOR_TRANSLATION | Ready for translation | translator | yes | no
#ff00ff  | READY_FOR_LAYOUT      | Ready for layout      | layouter   | yes | no
#00ffff  | ACCORD                | Accord                | pm         | yes | completed
#ff0000  | REVISION_REQUIRED     | Revision required     | previous   | yes | penalty
#ff9900  | FREELANCE_DRAFT       | Freelance draft       | freelance  | yes | no
```

## Stable Identity

Do not rely on A1 positions as identity.

Use:

```text
project_id
task_template_id
task_instance_id
cell_a1 as last known location only
```

## Dynamic CRUD

Adding client:
```text
create PROJECT
→ insert/copy column in Sheet 1
→ add metadata/registry
→ update snapshot
```

Adding task:
```text
create TASK_TEMPLATE
→ insert/copy row in Sheet 1
→ add metadata/registry
→ update snapshot
```

Deleting:
- archive, do not hard delete.
