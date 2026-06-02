/**
 * Read-only Apps Script Web App API for Worker bridge.
 * Release 0.3A reads Sheet 2 only and requires a shared read token.
 */

function doGet(e) {
  const action = getRequestParam_(e, 'action') || 'health';

  try {
    if (!isAuthorizedReadRequest_(e)) {
      return jsonResponse_({
        ok: false,
        action: action,
        data: null,
        error: 'Unauthorized.'
      }, 401);
    }

    if (action === 'health') {
      return jsonResponse_({
        ok: true,
        action: action,
        data: getReadApiHealth_(),
        error: null
      }, 200);
    }

    if (action === 'taskSnapshot') {
      return jsonResponse_({
        ok: true,
        action: action,
        data: getTaskSnapshotReadRows_(e),
        error: null
      }, 200);
    }

    if (action === 'changeLogSummary') {
      return jsonResponse_({
        ok: true,
        action: action,
        data: getChangeLogSummary_(),
        error: null
      }, 200);
    }

    if (action === 'performanceSummary') {
      return jsonResponse_({
        ok: true,
        action: action,
        data: getPerformanceSummary_(),
        error: null
      }, 200);
    }

    return jsonResponse_({
      ok: false,
      action: action,
      data: null,
      error: 'Unsupported action.'
    }, 404);
  } catch (error) {
    Logger.log('GAGA read API error: ' + (error && error.message ? error.message : String(error)));
    return jsonResponse_({
      ok: false,
      action: action,
      data: null,
      error: 'Read API error.'
    }, 500);
  }
}

function jsonResponse_(payload, statusCode) {
  const responsePayload = {
    ok: Boolean(payload && payload.ok),
    status: statusCode,
    action: payload && payload.action ? payload.action : '',
    data: payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : null,
    error: payload && payload.error ? payload.error : null,
    generatedAt: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(responsePayload))
    .setMimeType(ContentService.MimeType.JSON);
}

function isAuthorizedReadRequest_(e) {
  const expectedToken = PropertiesService
    .getScriptProperties()
    .getProperty(GAGA_CONFIG.appsScriptReadTokenProperty);
  const requestToken = getRequestParam_(e, 'token');

  if (!expectedToken || !requestToken) return false;
  return String(expectedToken) === String(requestToken);
}

function getReadApiHealth_() {
  return {
    availableActions: ['health', 'taskSnapshot', 'changeLogSummary', 'performanceSummary'],
    databaseConfigured: Boolean(GAGA_CONFIG.databaseSpreadsheetId),
    source: 'sheet2',
    note: 'Read-only Apps Script bridge.'
  };
}

function getTaskSnapshotReadRows_(e) {
  const sheet = getDatabaseSpreadsheet_().getSheetByName(GAGA_CONFIG.tabs.taskSnapshot);
  if (!sheet) return [];

  const limit = getLimitedInteger_(getRequestParam_(e, 'limit'), 200, 1000);
  const statusCode = String(getRequestParam_(e, 'status_code') || '').trim();
  const projectCode = String(getRequestParam_(e, 'project_code') || '').trim();
  const includeInactive = parseBooleanParam_(getRequestParam_(e, 'include_inactive'));
  const rows = readSheetObjects_(sheet);
  const filteredRows = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const isActive = String(row.active || '').toLowerCase() === 'true';

    if (!includeInactive && !isActive) continue;
    if (statusCode && String(row.status_code || '') !== statusCode) continue;
    if (projectCode && String(row.project_code_or_column_header || '') !== projectCode) continue;

    filteredRows.push(row);
    if (filteredRows.length >= limit) break;
  }

  return filteredRows;
}

function getChangeLogSummary_() {
  const sheet = getDatabaseSpreadsheet_().getSheetByName(GAGA_CONFIG.tabs.changeLog);
  if (!sheet) {
    return { totalRows: 0, lastChangedAt: '', lastSyncRunId: '' };
  }

  const rows = readSheetObjects_(sheet);
  const lastRow = getLastObjectRow_(rows);

  return {
    totalRows: rows.length,
    lastChangedAt: lastRow ? String(lastRow.changed_at || '') : '',
    lastSyncRunId: lastRow ? String(lastRow.sync_run_id || '') : ''
  };
}

function getPerformanceSummary_() {
  const sheet = getDatabaseSpreadsheet_().getSheetByName(GAGA_CONFIG.tabs.performanceLog);
  if (!sheet) {
    return {
      totalRuns: 0,
      lastStatus: '',
      lastDurationMs: '',
      lastSyncRunId: '',
      lastEndedAt: ''
    };
  }

  const rows = readSheetObjects_(sheet);
  const lastRow = getLastObjectRow_(rows);

  return {
    totalRuns: rows.length,
    lastStatus: lastRow ? String(lastRow.status || '') : '',
    lastDurationMs: lastRow ? lastRow.duration_ms : '',
    lastSyncRunId: lastRow ? String(lastRow.sync_run_id || '') : '',
    lastEndedAt: lastRow ? String(lastRow.ended_at || '') : ''
  };
}

function getLastObjectRow_(rows) {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (Object.keys(rows[index]).some(function (key) {
      return rows[index][key] !== '';
    })) {
      return rows[index];
    }
  }
  return null;
}

function getLimitedInteger_(value, defaultValue, maxValue) {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) return defaultValue;
  return Math.min(Math.floor(parsedValue), maxValue);
}

function parseBooleanParam_(value) {
  return String(value || '').toLowerCase() === 'true';
}

function getRequestParam_(e, key) {
  if (!e || !e.parameter) return '';
  return e.parameter[key] || '';
}
