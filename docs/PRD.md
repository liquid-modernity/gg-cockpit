# PRD.md — GAGA Cockpit OS

## 1. Product Name

GAGA Cockpit OS

## 2. Product Summary

GAGA Cockpit OS is an internal cockpit coordination layer for AR/SR production workflows.

The product converts an existing color-first Google Sheet cockpit into a structured operational system without removing the spreadsheet fallback.

The system supports:

- Google Sheet 1 as human operational cockpit and fallback.
- Google Sheet 2 as system database, registry, snapshot, logs, users, workflow, and KPI.
- A dashboard that shows filtered task cards by user, role, project, and workflow state.
- Google Apps Script as sync engine.
- Cloudflare Worker as API/auth/cache/webhook layer.
- Discord as notification and collaboration layer.
- GitHub Actions as CI/deploy executor because local device does not support Playwright/Wrangler reliably.

## 3. Problem Statement

The current AR/SR workflow relies on a wide Google Sheet where each client is represented across columns and each reporting content/task is represented across rows.

The team uses cell colors as fast visual workflow states.

This works well for humans because it is fast, compact, and does not consume extra columns.

However, the workflow lacks:

- user-specific task view;
- automated handoff;
- audit log;
- KPI/performance log;
- structured registry;
- controlled dashboard;
- Discord notification;
- reliable source-of-truth contract;
- technical guardrails for AI coding agents.

The product must improve automation without destroying the current spreadsheet workflow.

## 4. Product Goals

### Goal 1 — Preserve the existing operational fallback

The team must still be able to work directly in Google Sheet 1 when the dashboard fails.

### Goal 2 — Make the workflow machine-readable

Cell color changes in Google Sheet 1 must be translated into structured task status records in Google Sheet 2.

### Goal 3 — Reduce coordination friction

The system must route tasks to the correct user/role and send Discord notifications when handoff states change.

### Goal 4 — Enable dashboard-based execution

Users must see only relevant task cards based on email, PIN, role, access level, project assignment, and workflow state.

### Goal 5 — Support future KPI and gamification

Task completion events must produce logs that can later calculate points, velocity, deadline performance, and rework penalties.

### Goal 6 — Remain AI-agent friendly

The repo must include architecture contracts, naming laws, frontend boundaries, QA guards, and CI workflows.

## 5. Non-Goals

The MVP does not aim to:

- replace Google Sheets completely;
- build a full SaaS cockpit coordination tool;
- implement complex OAuth in the first phase;
- implement full Discord attendance monitoring in the first phase;
- implement real-time SSE/WebSocket in the first phase;
- implement AI knowledge assistant in the first phase;
- remove manual fallback editing from Google Sheet 1.

## 6. Users and Personas

### Managing Partner / Principal

Needs:
- project overview;
- bottleneck visibility;
- client progress;
- team accountability;
- fallback access;
- performance logs.

Access:
- can view all projects;
- can view in-house and freelance workflows;
- can access system dashboard and Sheet 1;
- can manage registry/configuration.

### Project Manager / Internal Lead

Needs:
- track assigned clients;
- monitor copywriter/translator/layouter progress;
- assign tasks;
- detect revisions;
- trigger handoff.

Access:
- can view internal and freelance tasks for assigned projects;
- may update statuses;
- may register new tasks/projects depending on permission.

### Copywriter

Needs:
- see draft tasks ready to write;
- open Google Docs quickly;
- mark copywriting complete.

Access:
- sees tasks assigned to copywriting workflow states.

### Translator

Needs:
- see content ready for translation;
- open source docs;
- mark translation complete.

Access:
- sees translation-ready tasks.

### Layouter

Needs:
- see content ready for layout;
- open docs/assets;
- mark layout complete/accord.

Access:
- sees layout-ready tasks.

### Freelancer

Needs:
- see only assigned external tasks;
- avoid exposure to full internal operations.

Access:
- restricted to their own freelance task tunnel.
- cannot see in-house full pipeline unless explicitly granted.

## 7. Core Workflow

### Sheet 1 to Dashboard

```text
User changes cell color in Google Sheet 1
→ Apps Script scans watched range
→ Apps Script compares current state with TASK_SNAPSHOT
→ changed cells are mapped to workflow status via WORKFLOW_COLORS
→ Sheet 2 TASK_SNAPSHOT is updated
→ CHANGE_LOG is appended
→ optional PERFORMANCE_LOG event is appended
→ optional Discord webhook is triggered
→ Dashboard reads updated structured data
```

### Dashboard to Sheet 1

```text
User clicks task action in Dashboard
→ Cloudflare Worker validates session/access
→ Worker calls Apps Script endpoint
→ Apps Script changes color in Google Sheet 1
→ Sheet 2 snapshot/log updates
→ Discord notification is sent
→ Dashboard refreshes
```

## 8. Functional Requirements

### FR-001 — Email + PIN Authentication

Users must log in using email and PIN.

MVP:
- email + PIN form;
- registry lookup in Sheet 2 or cache;
- placeholder session.

Future:
- PIN hash;
- secure cookie;
- rate limiting;
- optional Discord login.

Acceptance Criteria:
- valid user can access dashboard;
- invalid user is rejected;
- no Google OAuth required in MVP.

### FR-002 — Role-Based Task Routing

System must route task cards based on:

- user email;
- role;
- access level;
- project assignment;
- workflow state;
- color/status mapping.

Acceptance Criteria:
- copywriter sees copywriting tasks;
- translator sees translation tasks;
- layouter sees layout tasks;
- in-house can see permitted freelance tasks;
- freelancer cannot see unrelated in-house tasks.

### FR-003 — Color Workflow Registry

System must support registry-driven color mapping.

Example:

```text
#ffff00 → DRAFT_IN_PROGRESS
#00ff00 → READY_FOR_TRANSLATION
#ff00ff → READY_FOR_LAYOUT
#00ffff → ACCORD
#ff0000 → REVISION_REQUIRED
#ff9900 → FREELANCE_DRAFT
```

Acceptance Criteria:
- colors are not hardcoded in UI component files;
- color mapping is stored in registry;
- unknown colors are flagged.

### FR-004 — Sheet 1 Operational Fallback

Google Sheet 1 must remain usable when dashboard fails.

Acceptance Criteria:
- users can continue changing colors/links manually;
- sync can rebuild snapshot after dashboard outage;
- dashboard does not become the sole operational surface.

### FR-005 — Sheet 2 System Database

Sheet 2 must contain structured tabs:

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

Acceptance Criteria:
- user data is not stored in dashboard source code;
- workflow colors are configurable;
- snapshots/logs are appendable;
- Sheet 2 is protected from normal production users.

### FR-006 — Dashboard Task Cards

Dashboard must display task cards with:

- client;
- task/chapter title;
- workflow label;
- deadline label;
- Google Docs/Drive link;
- action button.

Acceptance Criteria:
- task cards are rendered from HTML template/hook;
- JS does not create arbitrary long HTML strings;
- task link opens in new tab safely;
- keyboard navigation works.

### FR-007 — Discord Notification

System must send Discord webhook messages for configured workflow events.

Acceptance Criteria:
- status changes can trigger Discord notification;
- notification content includes client, task, new status, and link when available;
- webhook URL is not hardcoded in source.

### FR-008 — Dynamic CRUD for Projects and Tasks

System must support adding/removing projects/tasks without rewriting code.

MVP:
- registry examples and Apps Script menu placeholders.

Future:
- add project from dashboard/menu;
- insert/copy column in Sheet 1;
- add task from dashboard/menu;
- insert/copy row in Sheet 1;
- register metadata/registry;
- archive instead of hard-delete.

Acceptance Criteria:
- project/task identity is not dependent only on A1 cell;
- layout registry tracks current location;
- manual Sheet 1 structure changes can be validated.

### FR-009 — Audit and Performance Logging

System must log:

- timestamp;
- actor/source;
- task ID;
- old status/color;
- new status/color;
- project/client;
- role;
- deadline delta when available.

Acceptance Criteria:
- logs are append-only;
- completed events can later feed KPI;
- rework/revision can later apply penalty.

### FR-010 — CI/CD Through GitHub Actions

Local device must not be required to run Playwright or Wrangler.

Acceptance Criteria:
- QA guards run in GitHub Actions;
- Playwright smoke tests run in GitHub Actions;
- Cloudflare Worker deploy runs in GitHub Actions;
- Cloudflare Pages deploy runs in GitHub Actions.

## 9. Non-Functional Requirements

### NFR-001 — Performance

- dashboard must be lightweight;
- avoid full spreadsheet reads where possible;
- use cache for registry/config;
- smart polling acceptable for MVP.

### NFR-002 — Reliability

- Google Sheet 1 fallback must work even if dashboard/API fails;
- sync can rebuild snapshot;
- logs must not be casually deleted.

### NFR-003 — Accessibility

- semantic HTML;
- labels for inputs;
- keyboard focus;
- visible focus ring;
- minimum hit target size;
- no keyboard trap.

### NFR-004 — Maintainability

- registry-driven configuration;
- no hardcoded workflow logic;
- no duplicate controllers;
- no random override CSS;
- generated files not edited manually.

### NFR-005 — AI-Agent Safety

- AGENTS.md required;
- source of truth documented;
- frontend contract documented;
- naming law documented;
- guards must block obvious contract violations.

### NFR-006 — Security

- PIN should be hashed in real implementation;
- Discord webhook not committed;
- Google credentials not committed;
- Sheet 2 access protected;
- freelancer access scoped.

## 10. MVP Scope

MVP includes:

- repo contracts;
- static dashboard shell;
- template-based task card rendering;
- placeholder login;
- placeholder task data;
- Apps Script sync skeleton;
- Worker API skeleton;
- Discord webhook skeleton;
- registry examples;
- GitHub Actions QA;
- Playwright smoke tests;
- Cloudflare deploy workflows.

MVP does not include:

- production Google Sheets API integration;
- production authentication;
- production PIN hashing;
- real Sheet 1 write-back;
- real-time SSE/WebSocket;
- Discord attendance bot;
- AI knowledge base.

## 11. Success Metrics

MVP is successful if:

- repo passes QA guards;
- dashboard shell loads;
- Playwright smoke test passes in GitHub Actions;
- task card renders from template;
- architecture docs prevent source-of-truth confusion;
- Apps Script skeleton can be extended without redesign;
- Worker skeleton can be deployed via GitHub Actions;
- future developer/AI agent can understand the system without asking for context.

## 12. Risks

### Risk 1 — Color Ambiguity

Different shades may represent the same perceived color.

Mitigation:
- strict color registry;
- validation script;
- unknown color warnings.

### Risk 2 — A1 Drift

Rows/columns can move.

Mitigation:
- task/project IDs;
- layout registry;
- future Developer Metadata.

### Risk 3 — Dashboard Becomes Parallel Database

Mitigation:
- dashboard writes back to Sheet 1;
- Sheet 2 records snapshot/log;
- source-of-truth contract.

### Risk 4 — Overengineering

Mitigation:
- MVP first;
- no SSE/bot/AI assistant before sync and dashboard are stable.

### Risk 5 — AI Agent Drift

Mitigation:
- AGENTS.md;
- QA guards;
- naming law;
- frontend contract.

## 13. Release Plan

### Release 0.1

- documentation and repo constitution;
- dashboard shell;
- QA guards;
- GitHub Actions;
- registry examples.

### Release 0.2

- Sheet 2 real registry;
- Apps Script reads Sheet 1 colors;
- snapshot compare;
- change log.

### Release 0.3

- dashboard reads structured task API;
- email + PIN verification;
- role-based filtering.

### Release 0.4

- dashboard status write-back to Sheet 1;
- Discord notifications;
- audit log.

### Release 0.5

- dynamic CRUD;
- KPI baseline;
- docs comment scanner prototype.
