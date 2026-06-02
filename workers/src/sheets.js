export async function getTasksForUser(email, env) {
  return readTaskSnapshot(env);
}

export async function readApiHealth(env) {
  return callAppsScriptReadAction(env, 'health');
}

export async function readTaskSnapshot(env, params = {}) {
  return callAppsScriptReadAction(env, 'taskSnapshot', params);
}

export async function readChangeLogSummary(env) {
  return callAppsScriptReadAction(env, 'changeLogSummary');
}

export async function readPerformanceSummary(env) {
  return callAppsScriptReadAction(env, 'performanceSummary');
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

async function callAppsScriptReadAction(env, action, params = {}) {
  assertAppsScriptReadEnv(env);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const url = new URL(env.APPS_SCRIPT_DEPLOYMENT_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('token', env.APPS_SCRIPT_READ_TOKEN);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        accept: 'application/json'
      }
    });
    const payload = await readJsonPayload(response);

    if (payload.status === 401 || response.status === 401) {
      const error = new Error('Upstream read authorization failed.');
      error.status = 502;
      throw error;
    }

    if (!response.ok || !payload.ok) {
      const error = new Error(payload.error || 'Apps Script read failed.');
      error.status = response.ok ? 502 : response.status;
      throw error;
    }

    return {
      data: payload.data,
      generatedAt: payload.generatedAt
    };
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const timeoutError = new Error('Apps Script read timed out.');
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function assertAppsScriptReadEnv(env) {
  if (!env.APPS_SCRIPT_DEPLOYMENT_URL || !env.APPS_SCRIPT_READ_TOKEN) {
    const error = new Error('Apps Script read bridge is not configured.');
    error.status = 503;
    throw error;
  }
}

async function readJsonPayload(response) {
  try {
    return await response.json();
  } catch (error) {
    const parseError = new Error('Apps Script returned invalid JSON.');
    parseError.status = 502;
    throw parseError;
  }
}
