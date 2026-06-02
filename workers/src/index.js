import { handleAuth } from './auth.js';
import { getTasksForUser, updateTaskStatus } from './sheets.js';
import { sendDiscordNotification } from './discord.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/auth') {
      return handleAuth(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/api/tasks') {
      const email = url.searchParams.get('email');
      const tasks = await getTasksForUser(email, env);
      return json({ tasks });
    }

    if (request.method === 'POST' && url.pathname === '/api/tasks/advance') {
      const payload = await request.json();
      const result = await updateTaskStatus(payload, env);
      await sendDiscordNotification({
        title: 'Task updated',
        description: `${payload.taskId} requested status update.`
      }, env);
      return json(result);
    }

    return json({ error: 'Not found' }, 404);
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
