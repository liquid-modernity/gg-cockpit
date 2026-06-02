# PRODUCTION_READINESS_CHECKLIST.md

## Production Definition

This repo is production-ready only when the system can be used for real cockpit work without losing status, leaking access, breaking fallback, or hiding errors.

## Gate 1 — Data Contract

- [ ] Sheet 1 watched range is defined.
- [ ] Sheet 1 color palette is locked.
- [ ] Sheet 1 fallback SOP is documented.
- [ ] Sheet 2 tabs are created.
- [ ] Sheet 2 registry schema is locked.
- [ ] Unknown color handling exists.
- [ ] A1 position is not treated as permanent identity.

## Gate 2 — Auth and Access

- [ ] Email + PIN uses hashed PIN.
- [ ] Session cookie is secure.
- [ ] Role routing is enforced server-side.
- [ ] Freelancer access is scoped.
- [ ] In-house access can monitor permitted freelance work.
- [ ] Unauthorized access returns clear error state.

## Gate 3 — Sheet Sync

- [ ] Apps Script reads Sheet 1 colors.
- [ ] Apps Script compares against Sheet 2 snapshot.
- [ ] Change log is append-only.
- [ ] Full rebuild exists.
- [ ] Dry-run sync exists.
- [ ] Repair snapshot exists.
- [ ] Sync errors are logged.

## Gate 4 — Dashboard Safety

- [ ] Dashboard is not source of truth.
- [ ] Dashboard write-back changes Sheet 1 color first.
- [ ] Dashboard has loading state.
- [ ] Dashboard has empty state.
- [ ] Dashboard has error state.
- [ ] Dashboard has fallback instruction state.
- [ ] Dashboard handles delayed sync.

## Gate 5 — CI/CD

- [ ] QA guards pass.
- [ ] Playwright smoke tests pass.
- [ ] Staging deploy exists.
- [ ] Production deploy requires manual approval.
- [ ] Production smoke test exists.
- [ ] Rollback procedure exists.

## Gate 6 — Security

- [ ] No tokens committed.
- [ ] Cloudflare secrets configured.
- [ ] GitHub environment secrets configured.
- [ ] Google credentials stored securely.
- [ ] Discord webhook stored securely.
- [ ] Sheet 2 protected.

## Gate 7 — Quota and Performance

- [ ] No full-sheet read per dashboard request.
- [ ] Registry caching exists.
- [ ] Backoff exists for Google API calls.
- [ ] Sync batching exists.
- [ ] Dashboard polling interval is controlled.
- [ ] Large-range scans are scheduled or throttled.

## Gate 8 — Observability

- [ ] Discord admin alert channel exists.
- [ ] Sync failure alerts exist.
- [ ] Unknown color alerts exist.
- [ ] Deploy success/failure notification exists.
- [ ] Change log includes notification status.

## Gate 9 — Backup and Recovery

- [ ] Daily Sheet 1 backup.
- [ ] Daily Sheet 2 backup.
- [ ] Weekly registry export.
- [ ] Monthly log archive.
- [ ] Full rebuild tested.
- [ ] Restore procedure tested.

## Gate 10 — Operating SOP

- [ ] Team knows Sheet 1 fallback behavior.
- [ ] Admin knows how to disable broken trigger.
- [ ] Admin knows how to restore snapshot.
- [ ] Admin knows how to switch to manual mode.
- [ ] Incident response owner is defined.

## Release Label Rule

```text
Codex-ready = architecture baseline is safe for AI implementation.
Beta-ready = sync + dashboard read are working internally.
Production-ready = all gates above are passed.
```
