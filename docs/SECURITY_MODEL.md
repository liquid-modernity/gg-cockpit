# SECURITY_MODEL.md

## Security Boundary

The cockpit dashboard is an internal operational surface.

The real security boundary must be enforced by:
- server-side role routing;
- Google Drive/Docs permissions;
- Sheet 2 access control;
- session validation;
- secret management.

## Authentication

MVP placeholder:
- email + PIN form.

Production:
- PIN must be hashed;
- session cookie must be signed;
- session cookie must be HttpOnly, Secure, SameSite=Lax or Strict;
- rate limiting must be added;
- repeated failed attempts must be logged.

## Authorization

Access level model:

```text
owner
= all access

admin
= registry + all cockpit data

inhouse_lead
= assigned projects + permitted freelance monitoring

inhouse_member
= assigned tasks + permitted overview

freelance
= own assigned tasks only
```

## Freelancer Rule

Freelancer must never receive:
- full Sheet 1 matrix;
- full internal task list;
- unrelated client links;
- in-house performance log;
- system registry.

## Secrets

Never commit:
- Cloudflare API token;
- Discord webhook URL;
- Google service account JSON;
- Apps Script deployment URL;
- session secret;
- PIN pepper.

Use:
- GitHub Actions secrets;
- GitHub environment secrets;
- Cloudflare Worker secrets.

## Google Docs Security

Dashboard cards may show links, but Google Drive permissions remain the payload security boundary.

If user clicks a document link without access, Google should block them.

## Audit

Security-sensitive events must be logged:
- login success/failure;
- unauthorized task access attempt;
- status update attempt;
- registry update;
- webhook failure;
- unknown color.
