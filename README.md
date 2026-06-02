# GAGA Cockpit OS

Starter repository for a Google Sheets-first cockpit coordination system.

This repo is designed for:

- Google Sheet 1 as operational cockpit and fallback.
- Google Sheet 2 as system database, registry, snapshot, log, user table, KPI, and workflow configuration.
- Dashboard as filtered UI, not the source of truth.
- Cloudflare Worker as API/auth/cache/webhook layer.
- Google Apps Script as sync engine.
- Discord as notification and collaboration layer.
- AI coding agents working under strict architecture rules.

## Core Principle

One system. One contract. One source of behavior. One visual rhythm. No override-on-override patches.

## MVP Scope

1. Sheet 1 color-first cockpit.
2. Sheet 2 registry/database.
3. Apps Script sync engine.
4. Cloudflare Worker API.
5. Static dashboard shell.
6. Email + PIN auth placeholder.
7. Discord webhook placeholder.
8. QA guard against architectural drift.

## What This Is Not

This is not a finished production app.
This is a clean baseline repo and technical constitution for controlled development.


## GitHub Actions

This repo includes CI workflows so local devices do not need to run Playwright or Wrangler.

- `.github/workflows/qa.yml`
- `.github/workflows/playwright.yml`
- `.github/workflows/deploy-worker.yml`
- `.github/workflows/deploy-pages.yml`

Read `docs/GITHUB_ACTIONS.md` before enabling deployment.


## Product Requirements

Formal PRD and traceability files are available:

- `docs/PRD.md`
- `docs/REQUIREMENTS_TRACEABILITY_MATRIX.md`
- `docs/ACCEPTANCE_CRITERIA.md`


## Codex Handoff

This repo is prepared for Codex/AI agent work in VS Code as a baseline implementation repository.

Read:

- `AGENTS.md`
- `docs/CODEX_HANDOFF.md`
- `docs/PRD.md`
- `docs/SOURCE_OF_TRUTH.md`
- `docs/FRONTEND_CONTRACT.md`

Local Playwright/Wrangler is not required. GitHub Actions handles those workflows.


## Cockpit, Not Generic Project Management

This repo intentionally uses the term Cockpit.

Google Sheet 1 is the shared operational cockpit where the team works on the same page. The web dashboard is only a curated surface, not a replacement for the cockpit.

Read:

- `docs/COCKPIT_PHILOSOPHY.md`
- `docs/PRODUCTION_READINESS_CHECKLIST.md`
- `docs/SECURITY_MODEL.md`
- `docs/DEPLOYMENT_RUNBOOK.md`
- `docs/BACKUP_RECOVERY.md`


## Migrated v0.8.1 Cockpit Surface

The earlier `gaga-cockpit-v081-colorfirst-fixed` prototype has been migrated into modular source.

Reference artifact:

- `legacy/cockpit-v081-reference.html`

Migration record:

- `docs/MIGRATION_FROM_V081.md`

The migrated implementation lives in:

- `src/app/index.html`
- `src/styles/cockpit-dashboard.css`
- `src/js/app.controller.js`
- `src/js/cockpit.controller.js`
- `src/js/cockpit-table.template.js`
- `src/config/cockpit.sample.json`
