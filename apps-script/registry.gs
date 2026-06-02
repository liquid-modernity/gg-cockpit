/**
 * Registry helpers.
 */

function getCockpitSpreadsheet_() {
  return SpreadsheetApp.openById(GAGA_CONFIG.cockpitSpreadsheetId);
}

function getDatabaseSpreadsheet_() {
  return SpreadsheetApp.openById(GAGA_CONFIG.databaseSpreadsheetId);
}

function getWorkflowColorMap_() {
  const database = getDatabaseSpreadsheet_();
  const sheet = database.getSheetByName(GAGA_CONFIG.tabs.workflowColors);
  if (!sheet) throw new Error(GAGA_CONFIG.tabs.workflowColors + ' not found. Run bootstrapGagaCockpitDatabase first.');

  const rows = readSheetObjects_(sheet);
  const colorMap = {};

  rows.forEach(function (row) {
    const hex = normalizeHex_(row.hex_color);
    if (!hex) return;

    colorMap[hex] = {
      hexColor: hex,
      statusCode: row.status_code,
      label: row.label,
      responsibleRole: row.responsible_role,
      notifyChannel: row.notify_channel,
      kpiEvent: row.kpi_event
    };
  });

  return colorMap;
}

function normalizeHex_(hex) {
  const value = String(hex || '').trim().toLowerCase();
  if (!value) return '';
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return '#' + value.charAt(1) + value.charAt(1) + value.charAt(2) + value.charAt(2) + value.charAt(3) + value.charAt(3);
  }
  return value;
}

function readSheetObjects_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn === 0) return [];

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = values[0].map(function (value) {
    return String(value || '').trim();
  });

  return values.slice(1).map(function (row) {
    return headers.reduce(function (record, header, index) {
      if (header) record[header] = row[index];
      return record;
    }, {});
  });
}
