# REQUIREMENTS_TRACEABILITY_MATRIX.md

| PRD ID | Requirement | Covered By | Status |
|---|---|---|---|
| FR-001 | Email + PIN Authentication | src/app/index.html, src/js/api.client.js, workers/src/auth.js | Placeholder |
| FR-002 | Role-Based Task Routing | workers/src/sheets.js, docs/PRD.md | Placeholder |
| FR-003 | Color Workflow Registry | src/config/workflow.registry.json, registry-examples/04_WORKFLOW_COLORS.csv | Initial |
| FR-004 | Sheet 1 Operational Fallback | docs/SOURCE_OF_TRUTH.md, docs/SHEET_CONTRACT.md | Documented |
| FR-005 | Sheet 2 System Database | docs/SHEET_CONTRACT.md, registry-examples/*.csv | Initial |
| FR-006 | Dashboard Task Cards | src/app/index.html, src/js/task-card.template.js | Initial |
| FR-007 | Discord Notification | workers/src/discord.js, apps-script/discord.gs | Skeleton |
| FR-008 | Dynamic CRUD | docs/SHEET_CONTRACT.md, apps-script/Code.gs | Planned |
| FR-009 | Audit and Performance Logging | apps-script/sync.gs, docs/PRD.md | Skeleton |
| FR-010 | GitHub Actions CI/CD | .github/workflows/*.yml, docs/GITHUB_ACTIONS.md | Initial |
| NFR-001 | Performance | docs/ARCHITECTURE.md, workers/src/cache.js | Initial |
| NFR-002 | Reliability | docs/SOURCE_OF_TRUTH.md | Documented |
| NFR-003 | Accessibility | src/app/index.html, tests/e2e/dashboard.spec.js | Initial |
| NFR-004 | Maintainability | AGENTS.md, docs/FRONTEND_CONTRACT.md, qa/*.mjs | Initial |
| NFR-005 | AI-Agent Safety | AGENTS.md, qa/*.mjs | Initial |
| NFR-006 | Security | docs/PRD.md, workers/src/auth.js | Placeholder |
