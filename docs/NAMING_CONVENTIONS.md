# NAMING_CONVENTIONS.md

## Namespace Law

| Prefix | Meaning |
|---|---|
| `gg-` | Global system component |
| `landing-` | Landing surface only |
| `store-` | Store surface only |
| `project-` | Project dashboard surface only |
| `sheet-` | Sheet integration module |
| `discord-` | Discord integration module |

## CSS Class Law

Use BEM-ish structure:

```text
.namespace-component
.namespace-component__element
.namespace-component--modifier
.gg-is-state
```

Examples:

```text
.gg-sheet
.gg-sheet__panel
.gg-dock
.gg-dock__item
.gg-discovery-result
.gg-discovery-result__title
.project-task-card
.project-task-card__status
.project-task-card--overdue
```

Forbidden:

```text
.active
.open
.card2
.newButton
.finalFix
.overridePanel
.tempStyle
```

## Data Attribute Law

Use `data-gg-*` for system behavior.

```html
data-gg-hook="task-card"
data-gg-action="advance-task"
data-gg-state="ready-layout"
data-gg-status="ACCORD"
data-gg-project-id="PROJECT_BOLT_2025"
```

## Token Law

Global tokens use:

```text
--gg-color-*
--gg-space-*
--gg-radius-*
--gg-shadow-*
--gg-motion-*
--gg-font-*
--gg-z-*
```

Surface tokens may use:

```text
--project-card-*
--landing-*
--store-*
```

## File Naming

Use lowercase kebab-case.

```text
app.controller.js
task-card.template.js
sheet-sync.service.js
workflow.registry.json
color.registry.json
```

Forbidden:

```text
final.js
newdashboard.js
fix2.css
style-new.css
dashboardBackupFinal.html
```

## Stable IDs

Use explicit IDs:

```text
PROJECT_BOLT_2025
PROJECT_WIKA_IKON_2025
TASK_LAPORAN_DIREKSI
USER_BHAKTI
```
