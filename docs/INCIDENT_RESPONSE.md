# INCIDENT_RESPONSE.md

## Incident Severity

### SEV-1

Production dashboard or sync causes incorrect task state, access leak, or large-scale data corruption.

Action:
- stop automation;
- switch team to Sheet 1 fallback;
- notify all users;
- restore backup if needed.

### SEV-2

Dashboard down, but Sheet 1 fallback works.

Action:
- notify team;
- keep work in Sheet 1;
- fix API/deploy;
- rebuild snapshot.

### SEV-3

Non-critical notification or UI bug.

Action:
- log issue;
- fix in normal release cycle.

## Incident Roles

```text
Incident Lead
= decides fallback/rollback

Technical Lead
= fixes Apps Script/Worker/repo

Operations Lead
= informs team and clients if needed
```

## Incident Template

```text
Incident:
Severity:
Detected at:
Affected users:
Affected clients:
Current workaround:
Action owner:
Next update:
Resolution:
Postmortem:
```

## Postmortem Questions

1. What failed?
2. Why did guard/QA not catch it?
3. Was Sheet 1 fallback usable?
4. Was data/log preserved?
5. What contract needs to change?
6. What test/guard must be added?
