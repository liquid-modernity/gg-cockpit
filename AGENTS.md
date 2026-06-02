# AGENTS.md

Rules for AI coding agents and human contributors.

## Absolute Rules

1. Do not rewrite the architecture without explicit instruction.
2. Do not create a second source of truth.
3. Do not make the dashboard the database.
4. Do not make Discord the database.
5. Do not treat exported Google Sheet HTML class names as data contracts.
6. Do not create CSS overrides on top of existing overrides.
7. Do not add new dependencies unless the need is documented.
8. Do not create duplicate utilities, controllers, or registries.
9. Do not generate HTML strings in behavior files.
10. Do not use `innerHTML` except inside an approved renderer/template module.
11. Do not hardcode workflow status, colors, user roles, project IDs, or copy text if registry exists.
12. Do not edit generated files directly.
13. Do not delete logs or audit history.
14. Do not hard-delete projects/tasks. Archive them.

## Rewrite, Not Override/Patch

“Rewrite” means:
- remove duplication;
- move repeated logic to a single contract;
- consolidate behavior into the controller/registry;
- delete obsolete code after replacement.

“Rewrite” does not mean:
- destroy working surfaces;
- blindly rebuild everything;
- create a new parallel implementation;
- add a patch over an old patch.

## Required Development Behavior

Before changing code, identify:
- source of truth affected;
- registry affected;
- UI surface affected;
- adapter affected;
- fallback behavior affected;
- QA guard affected.

Every change must preserve:

- HTML fallback.
- Semantic HTML.
- Accessibility.
- Mobile-first layout.
- Registry-driven behavior.
- Global visual rhythm.
- No unused CSS/JS/HTML.
- Sheet 1 operational fallback.
- Sheet 2 system database/log.
