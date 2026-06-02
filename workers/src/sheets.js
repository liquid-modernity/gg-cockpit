export async function getTasksForUser(email, env) {
  // TODO:
  // Load TASK_SNAPSHOT + USERS + ROLE_ROUTING from Sheet 2 / KV.
  // Filter by email, role, access_level.
  return [
    {
      id: 'TASK_DEMO_001',
      client: 'BOLT',
      title: 'Laporan Direksi',
      statusLabel: 'Ready for layout',
      deadlineLabel: 'Internal deadline: H-3',
      docUrl: 'https://docs.google.com/'
    }
  ];
}

export async function updateTaskStatus(payload, env) {
  // Rule:
  // Dashboard must write back to Sheet 1 color.
  // Then Sheet 2 snapshot/log must be updated.
  return {
    ok: true,
    taskId: payload.taskId,
    note: 'MVP placeholder. Implement Apps Script endpoint call here.'
  };
}
