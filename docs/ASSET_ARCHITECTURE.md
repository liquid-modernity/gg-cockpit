# ASSET_ARCHITECTURE.md

## Source vs Generated

```text
src/
= source of truth

dist/
= generated output

public/
= static public assets

generated/
= build artifacts or extracted artifacts
```

Generated files must not be edited manually.

## CSS Assets

CSS must flow from:

```text
tokens.css
→ global.css
→ components.css
→ surface CSS
```

Do not create patch files like:

```text
fix.css
override.css
new-style.css
temp.css
```

## JS Assets

Behavior must flow from:

```text
app.controller.js
→ services
→ adapters
→ renderers/templates
→ registry
```

Do not create duplicate controllers.

## Icon Policy

Icons must be registry-driven.

```json
{
  "open_task": "description",
  "project": "account_tree",
  "warning": "warning"
}
```

No random icon strings in component files.

## Microcopy Policy

Microcopy must be registry-driven when reused.

```json
{
  "auth.pin_label": "Masukkan PIN",
  "task.open_doc": "Buka Dokumen",
  "task.mark_done": "Tandai Selesai"
}
```

## Unused Asset Rule

Unused CSS, JS, and HTML must be removed.
Keeping dead files because “maybe later” is not allowed.
