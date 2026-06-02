# COCKPIT_PHILOSOPHY.md

## Why “Cockpit”, Not “Project Management”

This product should not be framed as a generic project management system.

It is a cockpit.

The difference matters.

A project management system usually implies:
- separate boards;
- separate task tools;
- rigid ticket workflow;
- extra administration;
- management watching workers.

A cockpit means:
- the team works on the same operational surface;
- Google Sheet 1 remains the shared working page;
- colors remain the fast visual state language;
- the dashboard is only a curated surface;
- automation supports the team instead of replacing their working habits.

## Product Position

```text
Google Sheet 1
= shared operational cockpit and fallback

Google Sheet 2
= system database, registry, snapshot, log, user table, KPI

Cockpit Dashboard
= filtered cockpit surface for each user/role

Apps Script + Cloudflare
= automation and routing layer

Discord
= coordination and notification layer
```

## Naming Discipline

Use “cockpit” when referring to the overall product.

Use “dashboard” only when referring to the web surface.

Correct:
- GAGA Cockpit OS
- Cockpit Dashboard
- Sheet 1 operational cockpit
- dashboard surface

Avoid:
- generic project management app
- PM SaaS
- task management replacement
- dashboard as source of truth

## Strategic Principle

The product must not force the team to leave the shared cockpit.

It must reduce friction around the cockpit:
- routing;
- notification;
- user-specific view;
- audit log;
- KPI;
- fallback;
- recovery.

The Google Sheet is not a temporary hack. It is the operational cockpit.
