Stop and fix clasp file-extension drift.

After running clasp pull, apps-script now contains:
- appsscript.json
- Code.js
- config.js
- bootstrap.js
- registry.js
- sync.js
- discord.js

The repo also still contains old .gs files, causing clasp push to fail:
"A file with this name already exists in the current project: bootstrap"

Standardize the repo so Apps Script source files use .js under apps-script/.

Tasks:
1. Move/copy any latest 0.2B work from .gs files into the corresponding .js files.
2. Remove duplicate .gs files from apps-script/.
3. Keep appsscript.json.
4. Update docs and prompts that reference apps-script/*.gs to apps-script/*.js where appropriate.
5. Update QA guards only if they explicitly scan .gs.
6. Ensure deploy-clasp.yml pushes only apps-script through .clasp.json rootDir.
7. Run npm run qa.
8. Then run clasp status.
9. Do not run clasp push until the duplicate .gs files are gone.

Do not change the dashboard surface.
Do not deploy Web App.
Do not implement unrelated features.