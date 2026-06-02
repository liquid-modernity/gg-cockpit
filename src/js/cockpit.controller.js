import { renderCockpitTable, collectWorkItems, restoreCellSourceColors } from './cockpit-table.template.js';
import { renderTaskCard } from './task-card.template.js';

let cockpitData = null;

export async function initializeCockpit() {
  cockpitData = await loadCockpitData();
  renderCockpitTable({ data: cockpitData, onCellSelect: selectCell });
  renderTasks(collectWorkItems(cockpitData));
  bindCockpitActions();
  bindDiscovery();
  restoreCellSourceColors();
}

async function loadCockpitData() {
  const response = await fetch('../config/cockpit.sample.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load cockpit sample data.');
  }
  return response.json();
}

function bindCockpitActions() {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-gg-action]');
    if (!action) return;

    const actionName = action.dataset.ggAction;

    if (actionName === 'set-view-mode') setViewMode(action.dataset.ggViewMode, action);
    if (actionName === 'toggle-theme') toggleTheme();
    if (actionName === 'show-tasks') showTasks();
    if (actionName === 'show-cockpit') showCockpit();
    if (actionName === 'toggle-outline') toggleOutline();
    if (actionName === 'open-discovery') openDiscovery();
    if (actionName === 'close-discovery') closeDiscovery();

    if (actionName === 'sync-placeholder') {
      window.alert('Production flow: sync must update Sheet 1/Sheet 2 through Apps Script.');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !isTypingTarget(event.target)) {
      event.preventDefault();
      openDiscovery();
    }

    if (event.key === 'Escape') {
      closeDiscovery();
    }
  });
}

function selectCell(payload) {
  document.querySelectorAll('.cockpit-cell.gg-is-selected').forEach((node) => {
    node.classList.remove('gg-is-selected');
  });

  payload.element.classList.add('gg-is-selected');

  const selectedChip = document.querySelector('[data-gg-hook="selected-chip"]');
  const outlineCurrent = document.querySelector('[data-gg-hook="outline-current"]');
  const outlineSummary = document.querySelector('[data-gg-hook="outline-summary"]');
  const outlineLink = document.querySelector('[data-gg-hook="outline-open-link"]');
  const outline = document.querySelector('[data-gg-hook="detail-outline"]');

  const label = `${payload.clientCode} · ${payload.taskLabel} · ${payload.statusLabel}`;

  if (selectedChip) selectedChip.textContent = label;
  if (outlineCurrent) outlineCurrent.textContent = label;
  if (outlineSummary) outlineSummary.textContent = payload.statusKey;
  if (outlineLink) {
    outlineLink.href = payload.url || '#';
    outlineLink.hidden = !payload.url;
  }
  if (outline) {
    outline.dataset.ggOutlineState = 'peek';
    outline.classList.add('gg-has-selection');
  }
}

function setViewMode(mode, trigger) {
  if (!mode) return;

  document.documentElement.dataset.cockpitViewMode = mode;

  document.querySelectorAll('[data-gg-action="set-view-mode"]').forEach((button) => {
    button.classList.toggle('gg-is-active', button === trigger);
  });
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.ggTheme === 'dark' ? 'light' : 'dark';
  html.dataset.ggTheme = next;
}

function showTasks() {
  const cockpitSurface = document.querySelector('[data-gg-hook="cockpit-surface"]');
  const tasksSurface = document.querySelector('[data-gg-hook="tasks-surface"]');

  cockpitSurface.hidden = true;
  tasksSurface.hidden = false;

  updateDockState('show-tasks');
}

function showCockpit() {
  const cockpitSurface = document.querySelector('[data-gg-hook="cockpit-surface"]');
  const tasksSurface = document.querySelector('[data-gg-hook="tasks-surface"]');

  cockpitSurface.hidden = false;
  tasksSurface.hidden = true;

  updateDockState('show-cockpit');
}

function updateDockState(activeAction) {
  document.querySelectorAll('.cockpit-dock__item').forEach((button) => {
    button.classList.toggle('gg-is-active', button.dataset.ggAction === activeAction);
  });
}

function toggleOutline() {
  const outline = document.querySelector('[data-gg-hook="detail-outline"]');
  if (!outline) return;

  const isOpen = outline.dataset.ggOutlineState === 'open';
  outline.dataset.ggOutlineState = isOpen ? 'peek' : 'open';

  const tray = document.querySelector('[data-gg-hook="outline-tray"]');
  if (tray) tray.hidden = isOpen;
}

function renderTasks(tasks) {
  const taskList = document.querySelector('[data-gg-hook="task-list"]');
  if (!taskList) return;

  taskList.replaceChildren();

  for (const task of tasks) {
    taskList.appendChild(renderTaskCard(task, {
      onAdvance: () => {
        window.alert('Production flow: this action must write back to Sheet 1 color first.');
      }
    }));
  }
}

function bindDiscovery() {
  const input = document.querySelector('[data-gg-hook="discovery-input"]');
  if (!input) return;

  input.addEventListener('input', () => renderDiscoveryResults(input.value));
  renderDiscoveryResults('');
}

function openDiscovery() {
  const panel = document.querySelector('[data-gg-hook="discovery-panel"]');
  const input = document.querySelector('[data-gg-hook="discovery-input"]');

  if (!panel) return;

  panel.hidden = false;
  renderDiscoveryResults(input?.value || '');
  window.requestAnimationFrame(() => input?.focus());
}

function closeDiscovery() {
  const panel = document.querySelector('[data-gg-hook="discovery-panel"]');
  if (panel) panel.hidden = true;
}

function renderDiscoveryResults(query) {
  const host = document.querySelector('[data-gg-hook="discovery-results"]');
  const template = document.getElementById('cockpit-discovery-result-template');
  if (!host || !template || !cockpitData) return;

  const normalized = String(query || '').trim().toLowerCase();
  const items = buildDiscoveryItems(cockpitData).filter((item) => {
    if (!normalized) return true;
    return `${item.type} ${item.title} ${item.meta}`.toLowerCase().includes(normalized);
  }).slice(0, 30);

  host.replaceChildren();

  for (const item of items) {
    const fragment = template.content.cloneNode(true);
    const button = fragment.querySelector('[data-gg-hook="discovery-result"]');

    setText(button, 'type', item.type);
    setText(button, 'title', item.title);
    setText(button, 'meta', item.meta);

    button.addEventListener('click', () => {
      closeDiscovery();
      focusCell(item.projectId, item.taskId);
    });

    host.appendChild(fragment);
  }
}

function buildDiscoveryItems(data) {
  const items = [];

  for (const client of data.clients) {
    items.push({
      type: 'Client',
      title: client.code,
      meta: client.name,
      projectId: client.id,
      taskId: data.rows[2]?.id
    });
  }

  for (const task of collectWorkItems(data)) {
    items.push({
      type: 'Work Item',
      title: `${task.client} · ${task.title}`,
      meta: task.statusLabel,
      projectId: task.projectId,
      taskId: task.taskId
    });
  }

  return items;
}

function focusCell(projectId, taskId) {
  const cell = document.querySelector(`[data-gg-project-id="${projectId}"][data-gg-task-id="${taskId}"]`);
  if (!cell) return;

  cell.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  cell.click();
}

function setText(root, key, value) {
  const node = root.querySelector(`[data-gg-bind="${key}"]`);
  if (node) node.textContent = value || '';
}

function isTypingTarget(target) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName);
}
