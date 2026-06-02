import { handleAuth } from './auth.js';
import {
  readApiHealth,
  readChangeLogSummary,
  readPerformanceSummary,
  readTaskSnapshot,
  updateTaskStatus
} from './sheets.js';
import { sendDiscordNotification } from './discord.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = createRequestId();

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env)
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return readOnlyProxyResponse(request, env, requestId, 'health', 'no-store', function () {
        return readApiHealth(env);
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/tasks') {
      return readOnlyProxyResponse(request, env, requestId, 'tasks', 'max-age=30', function () {
        return readTaskSnapshot(env, {
          limit: url.searchParams.get('limit'),
          status_code: url.searchParams.get('status_code'),
          project_code: url.searchParams.get('project_code'),
          include_inactive: url.searchParams.get('include_inactive')
        });
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/change-log/summary') {
      return readOnlyProxyResponse(request, env, requestId, 'change-log-summary', 'max-age=30', function () {
        return readChangeLogSummary(env);
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/performance/summary') {
      return readOnlyProxyResponse(request, env, requestId, 'performance-summary', 'max-age=30', function () {
        return readPerformanceSummary(env);
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth') {
      return handleAuth(request, env);
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

async function readOnlyProxyResponse(request, env, requestId, sourceAction, cacheControl, loader) {
  try {
    const upstream = await loader();
    return json(readPayload(upstream.data, upstream.generatedAt, requestId), 200, {
      ...corsHeaders(request, env),
      'cache-control': cacheControl
    });
  } catch (error) {
    return json(errorPayload(mapReadError(error), requestId), mapReadStatus(error), {
      ...corsHeaders(request, env),
      'cache-control': 'no-store'
    });
  }
}

function readPayload(data, generatedAt, requestId) {
  return {
    ok: true,
    data: data || null,
    error: null,
    meta: {
      source: 'apps-script',
      generatedAt: generatedAt || new Date().toISOString(),
      requestId
    }
  };
}

function errorPayload(error, requestId) {
  return {
    ok: false,
    data: null,
    error,
    meta: {
      source: 'apps-script',
      generatedAt: new Date().toISOString(),
      requestId
    }
  };
}

function mapReadError(error) {
  if (error && error.status === 502 && error.message.includes('authorization')) {
    return 'Upstream read authorization failed.';
  }
  if (error && error.status === 504) return 'Upstream read timed out.';
  if (error && error.status === 503) return 'Read API is not configured.';
  return 'Read API unavailable.';
}

function mapReadStatus(error) {
  if (error && error.status === 504) return 504;
  if (error && error.status === 503) return 503;
  return 502;
}

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders
    }
  });
}

function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'req_' + Date.now() + '_' + Math.random().toString(16).slice(2);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('origin');
  const headers = {
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400'
  };

  if (env.ALLOWED_ORIGIN) {
    if (origin === env.ALLOWED_ORIGIN) {
      headers['access-control-allow-origin'] = env.ALLOWED_ORIGIN;
    }
    return headers;
  }

  if (env.ENVIRONMENT !== 'production') {
    headers['access-control-allow-origin'] = '*';
  }

  return headers;
}
