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

.github/workflows/deploy-clasp.yml
= push Apps Script source from apps-script
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
APPS_SCRIPT_READ_TOKEN
```

Apps Script push requires these repository secrets:

```text
CLASPRC_JSON
CLASP_JSON
```

`CLASP_JSON` must contain `rootDir` exactly equal to `apps-script`.

## Apps Script Clasp

Apps Script source lives in:

```text
apps-script/
```

The repo uses `.js` Apps Script source files only. Do not add `.gs` duplicates.

`.clasp.json` is ignored because GitHub Actions writes it from `CLASP_JSON` before running `qa:clasp-rootdir` and `clasp push`. Developers may keep an untracked local `.clasp.json` for `clasp status` or local push checks, but it must not be committed.

Validate the clasp push surface locally only after a local `.clasp.json` exists:

```text
npm run qa:clasp-rootdir
clasp status
```

## Worker Runtime Secrets

GitHub Actions secrets are CI/CD inputs. Cloudflare Worker runtime secrets must
also be configured in Cloudflare before the Worker can call Apps Script:

```text
APPS_SCRIPT_DEPLOYMENT_URL
APPS_SCRIPT_READ_TOKEN
```

Apps Script must store the same read token in Script Properties under:

```text
GAGA_APPS_SCRIPT_READ_TOKEN
```

`GOOGLE_SERVICE_ACCOUNT_JSON` is not used by the Release 0.3A Worker read API.

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
