Release 0.2D is accepted.

Current accepted state:
- Sheet 1 / Gaga Cockpit Web is operational cockpit and fallback.
- Sheet 2 / Gaga Cockpit Database contains registry, task snapshot, change log, performance log, and snapshot backup.
- Apps Script sync is accepted:
  - dry-run clean;
  - actual sync writes 07_TASK_SNAPSHOT;
  - 08_CHANGE_LOG append-only;
  - 09_PERFORMANCE_LOG;
  - 11_SNAPSHOT_BACKUP;
  - LockService sync protection;
  - unknown color blocking.
- clasp push works.
- GitHub Actions clasp push hardening is accepted.
- Apps Script source is standardized to apps-script/*.js only.
- .clasp.json is ignored and generated from GitHub Secrets.
- npm run qa passes.

Now implement Release 0.3A:
Cloudflare Worker read API from Sheet 2 via Apps Script bridge.

Do not change dashboard surface.
Do not implement dashboard read integration yet.
Do not implement write-back.
Do not implement role-based filtering yet.
Do not change sync classification logic.
Do not deploy Web App automatically.
Do not run wrangler deploy.
Do not store secrets in source code.
Do not use direct Google Sheets API in 0.3A.
Do not use GOOGLE_SERVICE_ACCOUNT_JSON in 0.3A.
Do not use PIN_PEPPER or SESSION_SECRET in 0.3A.

Read:
- AGENTS.md
- docs/SOURCE_OF_TRUTH.md
- docs/SHEET_CONTRACT.md
- docs/PRD.md
- docs/COCKPIT_PHILOSOPHY.md
- docs/SECURITY_MODEL.md
- docs/DEPLOYMENT_RUNBOOK.md
- docs/OBSERVABILITY.md
- docs/GITHUB_ACTIONS.md
- workers/src/index.js
- workers/src/auth.js
- workers/src/sheets.js
- workers/wrangler.toml
- apps-script/Code.js
- apps-script/config.js
- apps-script/sync.js
- apps-script/bootstrap.js

Existing GitHub Actions secrets:
- APPS_SCRIPT_DEPLOYMENT_URL
- APPS_SCRIPT_READ_TOKEN
- CLASPRC_JSON
- CLASP_JSON
- CLOUDFLARE_API_TOKEN
- GOOGLE_SERVICE_ACCOUNT_JSON
- PIN_PEPPER
- SESSION_SECRET

There may also be a GitHub secret named GAGA_APPS_SCRIPT_READ_TOKEN, but do not use it in Worker code. GAGA_APPS_SCRIPT_READ_TOKEN is the Apps Script Script Property name, not the Worker runtime secret name.

Secret meaning:
- APPS_SCRIPT_DEPLOYMENT_URL = Apps Script Web App deployment URL.
- APPS_SCRIPT_READ_TOKEN = shared read token used by Worker when calling Apps Script.
- GAGA_APPS_SCRIPT_READ_TOKEN = Apps Script Script Property key that stores the same token value inside Apps Script.
- CLOUDFLARE_API_TOKEN = only for Cloudflare deployment/auth in GitHub Actions, not Worker runtime.
- GOOGLE_SERVICE_ACCOUNT_JSON = not used in 0.3A.
- PIN_PEPPER and SESSION_SECRET = not used until later auth/session release.

Scope Part A — Apps Script read endpoint:

1. Add read-only Apps Script endpoint support.

Implement doGet(e), or update it if already exists.

Supported read-only actions:
- action=health
- action=taskSnapshot
- action=changeLogSummary
- action=performanceSummary

2. Protect Apps Script endpoint with shared token.

Add config:
APPS_SCRIPT_READ_TOKEN_PROPERTY = 'GAGA_APPS_SCRIPT_READ_TOKEN'

Read the expected token from Script Properties:
PropertiesService.getScriptProperties().getProperty(APPS_SCRIPT_READ_TOKEN_PROPERTY)

Do not hardcode the token.

For Release 0.3A, allow token through query param:
?token=...

If request token is missing or invalid:
- return JSON payload with status 401;
- do not expose data;
- do not reveal the expected token;
- do not log the token value.

3. Apps Script endpoint responses must be JSON.

Add helper:
jsonResponse_(payload, statusCode)

Payload shape:
{
  ok: boolean,
  status: number,
  action: string,
  data: object | array | null,
  error: string | null,
  generatedAt: ISO timestamp
}

4. action=health should return:
- ok true;
- available actions;
- generatedAt;
- no sensitive spreadsheet IDs, or masked IDs only.

5. action=taskSnapshot should read 07_TASK_SNAPSHOT.

Default behavior:
- return only active workflow rows.

Query params:
- limit optional, default 200, max 1000;
- status_code optional;
- project_code optional;
- include_inactive optional, default false.

6. action=changeLogSummary should return summary only, not full log:
- totalRows;
- lastChangedAt;
- lastSyncRunId if present.

7. action=performanceSummary should return:
- totalRuns;
- lastStatus;
- lastDurationMs;
- lastSyncRunId;
- lastEndedAt if present.

8. Do not expose full 08_CHANGE_LOG rows in 0.3A.

9. Add safe error handling:
- return JSON error payload;
- log server-side error message without secrets.

10. Update Apps Script menu only if useful.
Do not add destructive menu items.

Scope Part B — Cloudflare Worker read proxy:

11. Implement Worker read-only API routes:
- GET /api/health
- GET /api/tasks
- GET /api/change-log/summary
- GET /api/performance/summary

12. Worker calls Apps Script endpoint using env:
- APPS_SCRIPT_DEPLOYMENT_URL
- APPS_SCRIPT_READ_TOKEN

Do not hardcode either value.
Do not expose APPS_SCRIPT_READ_TOKEN to clients.
Do not log secret values.

13. Worker response shape:
{
  ok: boolean,
  data: object | array | null,
  error: string | null,
  meta: {
    source: 'apps-script',
    generatedAt: string,
    requestId: string
  }
}

14. Add requestId generation.

15. Add basic CORS for read-only endpoints.

Use env:
ALLOWED_ORIGIN

Rules:
- If ALLOWED_ORIGIN exists, allow only that origin.
- If ENVIRONMENT !== 'production', allow '*'.
- In production, do not default to '*'.

16. Add cache headers:
- /api/health: no-store
- /api/tasks: max-age=30
- /api/change-log/summary: max-age=30
- /api/performance/summary: max-age=30

17. Add timeout protection for Apps Script fetch if practical.

18. Add robust error mapping:
- Apps Script 401 should return generic unauthorized/upstream auth error;
- Apps Script error should return ok false;
- timeout should return ok false;
- do not leak token, URL, or stack trace to clients.

19. Update workers/wrangler.toml sample vars without secrets.
Do not put real secret values in wrangler.toml.

20. Add QA guard if useful:
- prevent hardcoded APPS_SCRIPT_READ_TOKEN values;
- prevent hardcoded Apps Script deployment URL;
- allow only env.APPS_SCRIPT_DEPLOYMENT_URL and env.APPS_SCRIPT_READ_TOKEN references.

21. Update docs:
- docs/SECURITY_MODEL.md
- docs/DEPLOYMENT_RUNBOOK.md
- docs/OBSERVABILITY.md
- docs/GITHUB_ACTIONS.md if needed

Document:
- GitHub Secrets are for CI/CD.
- Cloudflare Worker runtime still needs APPS_SCRIPT_DEPLOYMENT_URL and APPS_SCRIPT_READ_TOKEN as Worker env/secrets.
- Apps Script needs Script Property GAGA_APPS_SCRIPT_READ_TOKEN with the same token value.
- Do not use GOOGLE_SERVICE_ACCOUNT_JSON in 0.3A.

22. Add tests that do not require real network:
- unit-like route tests if existing structure supports it;
- otherwise static QA guard only.

23. Run:
- npm run qa
- node --check apps-script/*.js
- clasp status

Do not run clasp push unless I ask.
Do not run wrangler deploy unless I ask.

Output:
- files changed
- Apps Script files changed
- Worker files changed
- new env/secrets required
- manual Apps Script setup steps
- how to set Script Property GAGA_APPS_SCRIPT_READ_TOKEN
- how to deploy Apps Script Web App manually
- how to configure Cloudflare Worker secrets
- local validation commands
- first manual test sequence