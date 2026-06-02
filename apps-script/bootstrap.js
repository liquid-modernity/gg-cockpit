/**
 * Sheet 2 bootstrap and validation.
 * Creates missing tabs and headers without clearing filled sheets.
 */

function bootstrapGagaCockpitDatabase() {
  const database = getDatabaseSpreadsheet_();
  const schema = getGagaDatabaseSchema_();
  const report = {
    spreadsheetId: GAGA_CONFIG.databaseSpreadsheetId,
    tabs: []
  };

  schema.forEach(function (definition) {
    const sheet = getOrCreateSheet_(database, definition.name);
    const beforeLastRow = sheet.getLastRow();
    const headers = ensureHeaders_(sheet, definition.headers);
    const shouldAppendDefaults = beforeLastRow === 0 && definition.defaults.length > 0;

    if (shouldAppendDefaults) {
      sheet
        .getRange(2, 1, definition.defaults.length, definition.defaults[0].length)
        .setValues(definition.defaults);
    }

    report.tabs.push({
      name: definition.name,
      created: beforeLastRow === 0,
      headers: headers,
      defaultRowsAppended: shouldAppendDefaults ? definition.defaults.length : 0
    });
  });

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function validateGagaCockpitDatabase() {
  const database = getDatabaseSpreadsheet_();
  const schema = getGagaDatabaseSchema_();
  const report = {
    spreadsheetId: GAGA_CONFIG.databaseSpreadsheetId,
    valid: true,
    tabs: []
  };

  schema.forEach(function (definition) {
    const sheet = database.getSheetByName(definition.name);
    const tabReport = {
      name: definition.name,
      exists: Boolean(sheet),
      missingHeaders: []
    };

    if (!sheet) {
      report.valid = false;
      tabReport.missingHeaders = definition.headers.slice();
      report.tabs.push(tabReport);
      return;
    }

    const headers = readHeaderRow_(sheet);
    tabReport.missingHeaders = definition.headers.filter(function (header) {
      return headers.indexOf(header) === -1;
    });

    if (tabReport.missingHeaders.length > 0) report.valid = false;
    report.tabs.push(tabReport);
  });

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function getGagaDatabaseSchema_() {
  return [
    {
      name: GAGA_CONFIG.tabs.users,
      headers: ['user_id', 'name', 'email', 'pin_hash', 'role', 'access_level', 'discord_id', 'active'],
      defaults: [
        ['USER_BHAKTI', 'Bhakti', 'bhakti@example.com', 'REPLACE_WITH_HASH', 'layouter', 'inhouse', '', 'TRUE'],
        ['USER_SARI', 'Sari', 'sari@example.com', 'REPLACE_WITH_HASH', 'translator', 'inhouse', '', 'TRUE'],
        ['USER_VENDOR_A', 'Vendor A', 'vendor.a@example.com', 'REPLACE_WITH_HASH', 'freelance', 'external', '', 'TRUE']
      ]
    },
    {
      name: GAGA_CONFIG.tabs.projects,
      headers: ['project_id', 'project_name', 'client_name', 'status', 'owner_role', 'sheet_name', 'active'],
      defaults: []
    },
    {
      name: GAGA_CONFIG.tabs.taskTemplates,
      headers: ['task_template_id', 'label', 'task_type', 'default_row', 'owner_role', 'active'],
      defaults: []
    },
    {
      name: GAGA_CONFIG.tabs.workflowColors,
      headers: ['hex_color', 'status_code', 'label', 'responsible_role', 'notify_channel', 'kpi_event'],
      defaults: [
        ['#ffff00', 'DRAFT_IN_PROGRESS', 'Draft in progress', 'copywriter', '', 'none'],
        ['#00ff00', 'READY_FOR_TRANSLATION', 'Ready for translation', 'translator', 'project-updates', 'none'],
        ['#ff00ff', 'READY_FOR_LAYOUT', 'Ready for layout', 'layouter', 'project-updates', 'none'],
        ['#00ffff', 'ACCORD', 'Accord', 'pm', 'project-updates', 'completed'],
        ['#ff0000', 'REVISION_REQUIRED', 'Revision required', 'previous', 'revision-alerts', 'penalty'],
        ['#ff9900', 'FREELANCE_DRAFT', 'Freelance draft', 'freelance', 'project-updates', 'none']
      ]
    },
    {
      name: GAGA_CONFIG.tabs.roleRouting,
      headers: ['route_id', 'status_code', 'responsible_role', 'fallback_role', 'active'],
      defaults: []
    },
    {
      name: GAGA_CONFIG.tabs.sheetLayoutRegistry,
      headers: ['entity_type', 'entity_id', 'sheet_name', 'axis', 'current_index', 'metadata_key', 'active'],
      defaults: [
        ['project', 'PROJECT_BOLT_2025', GAGA_CONFIG.cockpitSheetName, 'column', 'D', 'project_id', 'TRUE'],
        ['project', 'PROJECT_WTON_2025', GAGA_CONFIG.cockpitSheetName, 'column', 'E', 'project_id', 'TRUE'],
        ['task', 'TASK_LAPORAN_DIREKSI', GAGA_CONFIG.cockpitSheetName, 'row', '23', 'task_id', 'TRUE']
      ]
    },
    {
      name: GAGA_CONFIG.tabs.taskSnapshot,
      headers: [
        'snapshot_id',
        'sheet_name',
        'cell_a1',
        'project_code_or_column_header',
        'row_number',
        'column_number',
        'cell_value',
        'hex_color',
        'status_code',
        'status_label',
        'responsible_role',
        'last_seen_at',
        'source_spreadsheet_id',
        'source_sheet_name',
        'source_range_a1',
        'active',
        'task_instance_id',
        'project_id',
        'task_template_id',
        'value'
      ],
      defaults: []
    },
    {
      name: GAGA_CONFIG.tabs.changeLog,
      headers: [
        'change_id',
        'changed_at',
        'sheet_name',
        'cell_a1',
        'previous_status_code',
        'new_status_code',
        'previous_hex_color',
        'new_hex_color',
        'cell_value',
        'responsible_role',
        'change_type',
        'source_spreadsheet_id',
        'sync_run_id',
        'actor_email',
        'source',
        'task_instance_id',
        'project_id',
        'task_template_id',
        'old_hex_color',
        'old_status_code',
        'notification_status'
      ],
      defaults: []
    },
    {
      name: GAGA_CONFIG.tabs.performanceLog,
      headers: ['event_id', 'event_at', 'task_instance_id', 'project_id', 'user_id', 'kpi_event', 'points_delta', 'metadata_json'],
      defaults: []
    },
    {
      name: GAGA_CONFIG.tabs.systemConfig,
      headers: ['config_key', 'config_value', 'description', 'updated_at'],
      defaults: [
        ['COCKPIT_SHEET_NAME', GAGA_CONFIG.cockpitSheetName, 'Sheet 1 tab scanned by Apps Script sync.', ''],
        ['WATCHED_RANGE_A1', GAGA_CONFIG.watchedRangeA1, 'Sheet 1 watched range for color dry-run scans.', '']
      ]
    }
  ];
}

function getGagaDatabaseDefinition_(name) {
  const schema = getGagaDatabaseSchema_();
  for (let index = 0; index < schema.length; index += 1) {
    if (schema[index].name === name) return schema[index];
  }
  throw new Error('Database schema definition not found: ' + name);
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function ensureHeaders_(sheet, requiredHeaders) {
  const existingHeaders = readHeaderRow_(sheet);
  const finalHeaders = existingHeaders.length ? existingHeaders.slice() : requiredHeaders.slice();

  requiredHeaders.forEach(function (header) {
    if (finalHeaders.indexOf(header) === -1) finalHeaders.push(header);
  });

  sheet.getRange(1, 1, 1, finalHeaders.length).setValues([finalHeaders]);
  sheet.setFrozenRows(1);
  return finalHeaders;
}

function readHeaderRow_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];

  return sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .map(function (value) {
      return String(value || '').trim();
    })
    .filter(function (value) {
      return value;
    });
}
