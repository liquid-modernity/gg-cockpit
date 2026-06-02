# DEPLOYMENT_RUNBOOK.md

## Deployment Principle

Local device should not run Playwright or Wrangler.

GitHub Actions is the execution machine.

## Environments

```text
development
= local editing / Codex in VS Code

staging
= automatic deploy from main

production
= manual approval deploy
```

## Required Secrets

GitHub repository/environment secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
DISCORD_WEBHOOK_URL
APPS_SCRIPT_DEPLOYMENT_URL
SESSION_SECRET
PIN_PEPPER
GOOGLE_SERVICE_ACCOUNT_JSON
CLASPRC_JSON
CLASP_JSON
```

`CLASP_JSON` is written to `.clasp.json` by the Apps Script GitHub Action. Keep local `.clasp.json` untracked; it is for developer machine support only.

## Staging Deploy

Trigger:
- push to main;
- or manual workflow dispatch.

Steps:
1. Checkout.
2. Install dependencies.
3. Run QA guards.
4. Run Playwright.
5. Deploy Worker staging.
6. Deploy Pages staging.
7. Run staging smoke test.
8. Notify Discord.

## Production Deploy

Trigger:
- manual workflow dispatch;
- requires GitHub Environment approval.

Steps:
1. Checkout approved commit.
2. Run QA guards.
3. Run Playwright.
4. Deploy Worker production.
5. Deploy Pages production.
6. Run production smoke test.
7. Notify Discord.

## Rollback

If production fails:
1. Stop further deploys.
2. Use Cloudflare deployment rollback if available.
3. Notify team to use Sheet 1 fallback.
4. Check logs.
5. Revert commit if needed.
6. Redeploy previous stable version.
7. Run smoke test.
8. Close incident.

## Deployment Rule

Do not deploy production if:
- QA fails;
- Playwright fails;
- source-of-truth guard fails;
- secrets are missing;
- Sheet 1 fallback is broken;
- dashboard write-back is untested.
