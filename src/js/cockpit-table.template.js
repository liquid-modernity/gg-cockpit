export function renderCockpitTable({ data, onCellSelect }) {
  const table = document.querySelector('[data-gg-hook="cockpit-table"]');
  const cellTemplate = document.getElementById('cockpit-cell-template');

  if (!table || !cellTemplate) {
    throw new Error('Missing cockpit table or cell template.');
  }

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');

  const contentHead = document.createElement('th');
  contentHead.className = 'cockpit-table__content-head';
  contentHead.scope = 'col';
  contentHead.textContent = 'Content';
  headRow.appendChild(contentHead);

  for (const client of data.clients) {
    const th = document.createElement('th');
    th.className = 'cockpit-table__client-head';
    th.scope = 'col';
    th.textContent = client.code;
    th.dataset.ggProjectId = client.id;
    headRow.appendChild(th);
  }

  thead.appendChild(headRow);

  const tbody = document.createElement('tbody');

  for (const row of data.rows) {
    const tr = document.createElement('tr');
    tr.dataset.ggTaskId = row.id;

    if (row.section) {
      tr.classList.add('cockpit-table__section-row');
    }

    const th = document.createElement('th');
    th.className = 'cockpit-table__content-cell';
    th.scope = 'row';
    th.textContent = row.label;
    tr.appendChild(th);

    for (const client of data.clients) {
      const fragment = cellTemplate.content.cloneNode(true);
      const td = fragment.querySelector('[data-gg-hook="cockpit-cell"]');
      const cell = getCell(data, row.id, client.id);
      const status = getStatus(data, cell.statusKey);

      td.dataset.ggTaskId = row.id;
      td.dataset.ggProjectId = client.id;
      td.dataset.ggClientCode = client.code;
      td.dataset.ggTaskLabel = row.label;
      td.dataset.ggStatusKey = cell.statusKey;
      td.dataset.ggStatusLabel = status.label;
      td.dataset.sourceBg = status.hex;
      td.dataset.cockpitStatusShort = status.short || '';
      td.style.setProperty('--cockpit-cell-bg', status.hex);
      td.style.setProperty('--cockpit-cell-fg', pickTextColor(status.hex));

      if (cell.url) {
        td.dataset.ggUrl = cell.url;
        td.classList.add('cockpit-cell--has-link');
      }

      if (cell.statusKey === 'EMPTY') {
        td.classList.add('cockpit-cell--empty');
      }

      if (cell.statusKey === 'BLOCK') {
        td.classList.add('cockpit-cell--locked');
      }

      const textNode = td.querySelector('[data-gg-bind="cellText"]');
      textNode.textContent = cell.text || '';

      td.addEventListener('click', () => onCellSelect({
        element: td,
        taskId: row.id,
        taskLabel: row.label,
        projectId: client.id,
        clientCode: client.code,
        text: cell.text || '',
        statusKey: cell.statusKey,
        statusLabel: status.label,
        url: cell.url || ''
      }));

      tr.appendChild(fragment);
    }

    tbody.appendChild(tr);
  }

  table.replaceChildren(thead, tbody);
}

export function collectWorkItems(data) {
  const items = [];

  for (const row of data.rows) {
    if (row.section || row.resource) continue;

    for (const client of data.clients) {
      const cell = getCell(data, row.id, client.id);
      const status = getStatus(data, cell.statusKey);

      if (!cell.text || cell.statusKey === 'EMPTY') continue;

      items.push({
        id: `${client.id}__${row.id}`,
        client: client.code,
        title: row.label,
        statusLabel: status.label,
        deadlineLabel: 'Internal deadline: registry-driven',
        docUrl: cell.url || '#',
        statusKey: cell.statusKey,
        projectId: client.id,
        taskId: row.id
      });
    }
  }

  return items;
}

export function restoreCellSourceColors(root = document) {
  const cells = root.querySelectorAll('[data-source-bg]');
  for (const cell of cells) {
    const bg = cell.dataset.sourceBg;
    if (bg) cell.style.setProperty('--cockpit-cell-bg', bg);
  }
}

function getCell(data, rowId, projectId) {
  return data.cells?.[rowId]?.[projectId] || {
    text: '',
    statusKey: 'EMPTY'
  };
}

function getStatus(data, statusKey) {
  return data.status?.[statusKey] || data.status.EMPTY;
}

function pickTextColor(hex) {
  const normalized = String(hex || '').replace('#', '');
  if (normalized.length !== 6) return '#111';

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

  return luminance < 140 ? '#fff' : '#111';
}
