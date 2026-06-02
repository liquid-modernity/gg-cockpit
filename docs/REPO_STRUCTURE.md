# REPO_STRUCTURE.md

## Folder Structure

```text
/
  AGENTS.md
  README.md
  package.json

  docs/
    ARCHITECTURE.md
    SOURCE_OF_TRUTH.md
    FRONTEND_CONTRACT.md
    NAMING_CONVENTIONS.md
    ASSET_ARCHITECTURE.md
    REPO_STRUCTURE.md
    SHEET_CONTRACT.md
    MVP_ROADMAP.md
    PRD.md
    REQUIREMENTS_TRACEABILITY_MATRIX.md
    ACCEPTANCE_CRITERIA.md
    CODEX_HANDOFF.md
    COCKPIT_PHILOSOPHY.md
    PRODUCTION_READINESS_CHECKLIST.md
    SECURITY_MODEL.md
    DEPLOYMENT_RUNBOOK.md
    BACKUP_RECOVERY.md
    OBSERVABILITY.md
    GOOGLE_QUOTA_STRATEGY.md
    INCIDENT_RESPONSE.md

  src/
    app/
      index.html
    styles/
      tokens.css
      global.css
      cockpit-dashboard.css
    js/
      app.controller.js
      cockpit.controller.js
      cockpit-table.template.js
      task-card.template.js
      api.client.js
    config/
      workflow.registry.json
      icons.registry.json
      microcopy.registry.json
      cockpit.sample.json

  workers/
    src/
      index.js
      auth.js
      sheets.js
      discord.js
      cache.js
    wrangler.toml

  apps-script/
    Code.js
    sync.js
    registry.js
    discord.js

  qa/
    architecture-guard.mjs
    frontend-contract-guard.mjs
    naming-guard.mjs
```

## Forbidden Structure

Do not create:

```text
/src-new
/src-final
/backup
/fix
/override
/temporary
/new-dashboard
```

## Public API Boundary

Only expose stable functions from central modules.
Do not let random files become hidden public APIs.


## GitHub Actions

```text
.github/
  workflows/
    qa.yml
    playwright.yml
    deploy-worker.yml
    deploy-pages.yml
```


## Production Workflows

```text
.github/
  workflows/
    deploy-staging.yml
    deploy-production.yml
    smoke-production.yml
```


## Legacy Reference

```text
legacy/
  cockpit-v081-reference.html
```

Legacy files are reference artifacts only. They are not production source files.
