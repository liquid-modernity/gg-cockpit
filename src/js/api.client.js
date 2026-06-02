export async function login({ email, pin }) {
  // MVP placeholder. Replace with Cloudflare Worker endpoint.
  if (!email || !pin) {
    throw new Error('Email and PIN are required.');
  }

  return {
    user: {
      id: 'USER_DEMO',
      name: email.split('@')[0],
      role: 'demo'
    },
    tasks: [
      {
        id: 'TASK_DEMO_001',
        client: 'BOLT',
        title: 'Laporan Direksi',
        statusLabel: 'Ready for layout',
        deadlineLabel: 'Internal deadline: H-3',
        docUrl: 'https://docs.google.com/'
      }
    ]
  };
}

export async function advanceTask(taskId) {
  // MVP placeholder. Real flow must update Sheet 1 color first.
  return { ok: true, taskId };
}
