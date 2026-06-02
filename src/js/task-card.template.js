export function renderTaskCard(task, { onAdvance }) {
  const template = document.getElementById('project-task-card-template');

  if (!template) {
    throw new Error('Missing project-task-card-template.');
  }

  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('[data-gg-hook="task-card"]');

  card.dataset.ggTaskId = task.id;
  setText(card, 'client', task.client);
  setText(card, 'title', task.title);
  setText(card, 'statusLabel', task.statusLabel);
  setText(card, 'deadlineLabel', task.deadlineLabel);
  setHref(card, 'docUrl', task.docUrl);

  const advanceButton = card.querySelector('[data-gg-action="advance-task"]');
  advanceButton.addEventListener('click', () => onAdvance(task.id));

  return fragment;
}

function setText(root, key, value) {
  const node = root.querySelector(`[data-gg-bind="${key}"]`);
  if (node) node.textContent = value || '';
}

function setHref(root, key, value) {
  const node = root.querySelector(`[data-gg-bind-href="${key}"]`);
  if (node) node.href = value || '#';
}
