Release 0.2C security hardening patch.

.clasp.json contains Apps Script project config and should not be tracked in git because CLASP_JSON is already stored in GitHub Secrets.

Patch the repo:

1. Add .clasp.json to .gitignore.
2. Remove .clasp.json from git tracking.
3. Keep local support documented: developers may keep an untracked .clasp.json locally.
4. Ensure deploy-clasp.yml writes .clasp.json from secrets.CLASP_JSON before running qa:clasp-rootdir.
5. Ensure npm run qa does not require .clasp.json.
6. Keep qa:clasp-rootdir as a separate script used only after .clasp.json exists.
7. Do not change dashboard.
8. Do not change Apps Script sync logic.
9. Run npm run qa.

Output:
- files changed
- exact git commands I should run
- final expected workflow order