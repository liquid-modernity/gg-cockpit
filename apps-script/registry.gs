/**
 * Registry helpers.
 */

function getSystemSpreadsheet_() {
  return SpreadsheetApp.openById(GAGA_CONFIG.systemSpreadsheetId);
}

function getWorkflowColorMap_() {
  // TODO:
  // Read 04_WORKFLOW_COLORS from Sheet 2.
  return {
    '#ffff00': 'DRAFT_IN_PROGRESS',
    '#00ff00': 'READY_FOR_TRANSLATION',
    '#ff00ff': 'READY_FOR_LAYOUT',
    '#00ffff': 'ACCORD',
    '#ff0000': 'REVISION_REQUIRED',
    '#ff9900': 'FREELANCE_DRAFT'
  };
}

function normalizeHex_(hex) {
  return String(hex || '').trim().toLowerCase();
}
