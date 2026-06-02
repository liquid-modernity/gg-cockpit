# ACCEPTANCE_CRITERIA.md

## MVP Acceptance Criteria

The MVP is acceptable when:

1. `npm run qa` passes in GitHub Actions.
2. Playwright smoke test passes in GitHub Actions.
3. Dashboard shell loads.
4. Email + PIN form exists and has labels.
5. Demo task cards render from `<template>`.
6. JS controller does not use arbitrary `innerHTML`.
7. Workflow colors exist in registry.
8. Sheet 1 fallback rule is documented.
9. Sheet 2 database structure is documented.
10. Cloudflare Worker deploy workflow exists.
11. Cloudflare Pages deploy workflow exists.
12. PRD exists and maps requirements to source files.
13. Repo has AGENTS.md and source-of-truth contract.

## Not Accepted

The MVP is not acceptable if:

- dashboard is described as source of truth;
- workflow colors are hardcoded only inside UI files;
- JS creates long ad-hoc HTML strings;
- there are duplicate source-of-truth claims;
- generated/output files are treated as source;
- local Playwright/Wrangler is required to validate the repo;
- freelancer/in-house access distinction is not documented.
