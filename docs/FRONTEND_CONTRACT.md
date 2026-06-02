# FRONTEND_CONTRACT.md

## Responsibility Boundary

```text
HTML = structure, semantics, fallback
CSS = visual rhythm, layout, tokens, responsive behavior
JS = behavior, state, orchestration, hydration
Registry = configuration and content control
```

## HTML Contract

HTML must remain meaningful without JavaScript where possible.

Required:
- semantic sections;
- landmark elements;
- accessible labels;
- buttons for actions;
- anchors for navigation;
- templates for dynamic task cards;
- data hooks for JS.

## CSS Contract

CSS must use global tokens and surface namespaces.

Required:
- `--gg-*` for global tokens;
- `--project-*` for project dashboard tokens if needed;
- no random one-off overrides;
- no inline styles from JS unless strictly state-variable based.

## JS Contract

JS may:
- attach event listeners;
- hydrate existing HTML;
- clone `<template>`;
- update `textContent`;
- update `href`;
- update `hidden`;
- update `aria-*`;
- update `data-*` state;
- call APIs.

JS must not:
- generate long arbitrary HTML strings;
- use `innerHTML` in controller files;
- inject CSS classes without registry/contract;
- hardcode workflow labels/colors/icons;
- duplicate template logic.

## Approved Rendering Pattern

HTML:

```html
<template id="project-task-card-template">
  <article class="project-task-card" data-gg-hook="task-card">
    <header class="project-task-card__head">
      <p class="project-task-card__client" data-gg-bind="client"></p>
      <strong class="project-task-card__title" data-gg-bind="title"></strong>
    </header>
    <p class="project-task-card__status" data-gg-bind="statusLabel"></p>
    <a class="project-task-card__link" data-gg-bind-href="docUrl">Buka Dokumen</a>
    <button class="project-task-card__action" data-gg-action="advance-task">
      Tandai Selesai
    </button>
  </article>
</template>
```

JS:
- clone template;
- fill `[data-gg-bind]`;
- fill `[data-gg-bind-href]`;
- set `data-gg-status`.

## Accessibility

Every interactive element must have:
- accessible name;
- keyboard focus;
- visible focus state;
- minimum target size;
- no keyboard trap;
- correct ARIA only when necessary.
