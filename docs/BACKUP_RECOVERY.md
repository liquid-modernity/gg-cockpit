# BACKUP_RECOVERY.md

## Backup Targets

Backup:

```text
Google Sheet 1
= operational cockpit

Google Sheet 2
= system database/log/registry

Repo
= GitHub source

Cloudflare config
= Worker/Pages configuration

Apps Script
= script source and deployment version
```

## Backup Frequency

```text
Daily
- Sheet 1 backup
- Sheet 2 backup

Weekly
- registry CSV export
- system config export

Monthly
- archive logs
- restore drill
```

## Recovery Scenarios

### Dashboard Down

Action:
1. Team continues work in Sheet 1.
2. Admin posts Discord notice.
3. Disable dashboard write-back if needed.
4. Fix Worker/Pages.
5. Run sync rebuild.

### Apps Script Broken

Action:
1. Disable broken trigger.
2. Continue manual Sheet 1 work.
3. Restore previous script version.
4. Run dry-run sync.
5. Run rebuild snapshot.

### Sheet 2 Corrupted

Action:
1. Stop sync.
2. Restore latest Sheet 2 backup.
3. Run full rebuild from Sheet 1.
4. Validate snapshot count.
5. Re-enable sync.

### Wrong Mass Color Edit

Action:
1. Stop sync.
2. Inspect CHANGE_LOG.
3. Restore Sheet 1 backup if necessary.
4. Rebuild snapshot.
5. Notify affected team.

## Recovery Acceptance

Recovery is acceptable only if:
- Sheet 1 remains usable;
- task snapshot is rebuilt;
- logs are preserved or restored;
- team has clear instruction;
- dashboard returns to normal without hidden drift.
