Release 0.2B is accepted.

Now implement Release 0.2C: controlled GitHub Actions clasp push hardening.

Current state:
- Apps Script source is standardized to apps-script/*.js only.
- appsscript.json exists.
- .clasp.json uses rootDir: apps-script.
- clasp push works locally.
- npm run qa passes.
- TASK_SNAPSHOT and CHANGE_LOG sync are accepted.

Do not change dashboard.
Do not change Apps Script sync logic.
Do not deploy Web App.
Do not implement Worker API yet.

Scope:
1. Harden .github/workflows/deploy-clasp.yml.
2. Ensure workflow runs npm ci and npm run qa before clasp push.
3. Add rootDir guard before clasp push.
4. Verify .clasp.json has rootDir exactly "apps-script".
5. Verify apps-script contains no .gs files.
6. Verify apps-script/appsscript.json exists.
7. Verify these files exist:
   - apps-script/Code.js
   - apps-script/config.js
   - apps-script/bootstrap.js
   - apps-script/registry.js
   - apps-script/sync.js
   - apps-script/discord.js
8. Write CLASPRC_JSON from GitHub Secret to ~/.clasprc.json.
9. Write CLASP_JSON from GitHub Secret to .clasp.json if the workflow depends on secrets.
10. Do not echo secrets.
11. Add npm script if useful:
    qa:clasp-rootdir
12. Run npm run qa.

Output:
- files changed
- final deploy-clasp.yml
- GitHub Secrets required
- local commands to validate before push