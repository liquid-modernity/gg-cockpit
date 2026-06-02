# CODEX_HANDOFF.md

## Is this repo ready for Codex in VS Code?

Yes, as a baseline repository for implementation tasks.

It is not a finished application.

Codex should be instructed to:
1. Read `AGENTS.md` first.
2. Read `docs/PRD.md`.
3. Read `docs/SOURCE_OF_TRUTH.md`.
4. Read `docs/FRONTEND_CONTRACT.md`.
5. Run `npm run qa` after changes.
6. Avoid adding dependencies unless necessary.
7. Keep Google Sheet 1 as operational fallback.
8. Keep Google Sheet 2 as system database/log/registry.
9. Never make dashboard a second source of truth.
10. Use GitHub Actions for Playwright/Wrangler validation and deployment.

## Recommended First Codex Prompt

```text
Read AGENTS.md, docs/PRD.md, docs/SOURCE_OF_TRUTH.md, docs/FRONTEND_CONTRACT.md, docs/SHEET_CONTRACT.md, and docs/MVP_ROADMAP.md.

Do not implement new features yet.

First, audit the repo for contract conflicts, missing scripts, broken GitHub Actions assumptions, and files that would confuse an AI coding agent.

Then produce a short implementation plan for Release 0.2: real Sheet 2 registry + Apps Script color sync + snapshot compare + change log.

Do not rewrite the architecture. Do not add dependencies unless required.
```

## Recommended Task Order for Codex

1. Harden QA guards.
2. Implement Sheet 2 tab bootstrap script.
3. Implement Apps Script color scan.
4. Implement snapshot compare.
5. Implement change log append.
6. Implement Discord webhook from Apps Script.
7. Implement Worker task API reading from Sheet 2.
8. Implement email + PIN against USERS registry.
9. Implement dashboard write-back to Sheet 1 color.
10. Add Playwright tests for task filtering and write-back behavior.

## Local Device Constraint

The user's local device does not need to run Playwright or Wrangler.

Validation and deployment are done by GitHub Actions.
