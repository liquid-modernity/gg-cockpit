# MIGRATION_FROM_V081.md

## Purpose

This document records the direct migration from `gaga-cockpit-v081-colorfirst-fixed` into the modular GAGA Cockpit OS baseline.

The old file is preserved as:

```text
legacy/cockpit-v081-reference.html
```

It is a reference artifact, not the production source of truth.

## What Was Migrated

| Legacy v0.8.1 Concept | New Modular Destination |
|---|---|
| Appbarless shell | `src/app/index.html`, `src/styles/cockpit-dashboard.css` |
| Minimal iCloud-like login | `src/app/index.html`, `src/styles/cockpit-dashboard.css`, `src/js/app.controller.js` |
| Global bottom dock | `src/app/index.html`, `src/styles/cockpit-dashboard.css`, `src/js/cockpit.controller.js` |
| Detail outline/search bar | `src/app/index.html`, `src/styles/cockpit-dashboard.css`, `src/js/cockpit.controller.js` |
| View modes: fit/focus/compare/presentation | `src/js/cockpit.controller.js`, `src/styles/cockpit-dashboard.css` |
| Color-first cells | `src/config/cockpit.sample.json`, `src/js/cockpit-table.template.js` |
| `data-source-bg` restoration concept | `src/js/cockpit-table.template.js`, `src/js/cockpit.controller.js` |
| Work item/task cards | `src/app/index.html`, `src/js/task-card.template.js` |
| Cockpit terminology | `docs/COCKPIT_PHILOSOPHY.md`, `docs/PRD.md`, source UI copy |

## What Was Not Migrated

The following legacy patterns were intentionally not migrated:

- stacked hotfix CSS;
- monolithic all-in-one HTML/CSS/JS file;
- arbitrary `innerHTML`;
- UI status as permanent client-side state;
- local-only status mutation as source of truth;
- generic project management framing.

## Current Migration Status

This ZIP includes a migrated first-pass cockpit surface:

- login surface;
- cockpit table;
- color-first cells;
- dock;
- discovery/detail outline;
- task cards;
- view mode controls;
- sample registry-driven data;
- template-based rendering;
- QA guards passing.

The migrated surface is still not production-integrated with real Google Sheet 1/Sheet 2. It is a modularized source version of the v0.8.1 cockpit experience.
