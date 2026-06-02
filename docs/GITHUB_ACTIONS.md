# GITHUB_ACTIONS.md

## Why GitHub Actions

If the local device cannot run Playwright or Wrangler reliably, GitHub Actions becomes the execution machine.

Local device:
- edit files;
- commit;
- push;
- review GitHub logs.

GitHub Actions:
- run architecture guards;
- run Playwright browser smoke tests;
- deploy Cloudflare Worker;
- deploy Cloudflare Pages.

## Workflows

```text
.github/workflows/qa.yml
= architecture + frontend + naming guards

.github/workflows/playwright.yml
= browser smoke tests on Chromium

.github/workflows/deploy-worker.yml
= deploy Cloudflare Worker API

.github/workflows/deploy-pages.yml
= deploy static dashboard to Cloudflare Pages
```

## Required GitHub Secrets

For deploy workflows, add this secret:

```text
CLOUDFLARE_API_TOKEN
```

Optional future secrets:

```text
CLOUDFLARE_ACCOUNT_ID
DISCORD_WEBHOOK_URL
GOOGLE_SERVICE_ACCOUNT_JSON
APPS_SCRIPT_DEPLOYMENT_URL
```

## Recommended Operating Rule

Do not require local Playwright or local Wrangler.

The local machine only needs:
- git;
- browser;
- text editor;
- GitHub access.

## Deployment Notes

Worker deploy uses:

```text
cloudflare/wrangler-action@v3
workingDirectory: workers
command: deploy
```

Pages deploy uses:

```text
cloudflare/wrangler-action@v3
command: pages deploy src --project-name=gaga-project-dashboard
```

## CI Discipline

Pull request should pass:

```text
npm run qa
npx playwright test --project=chromium
```

If it fails in GitHub Actions, fix the source. Do not bypass the guard unless the contract document is intentionally updated.
