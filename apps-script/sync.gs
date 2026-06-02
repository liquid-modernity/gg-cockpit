/**
 * Sync color state from Sheet 1 to Sheet 2.
 * Release 0.2A implements the read-only dry-run foundation.
 */

function syncCockpitColorsToDatabaseDryRun() {
  const cockpitSpreadsheet = getCockpitSpreadsheet_();
  const cockpit = cockpitSpreadsheet.getSheetByName(GAGA_CONFIG.cockpitSheetName);
  if (!cockpit) throw new Error('Cockpit sheet not found: ' + GAGA_CONFIG.cockpitSheetName);

  const range = cockpit.getRange(GAGA_CONFIG.watchedRangeA1);
  const values = range.getValues();
  const backgrounds = range.getBackgrounds();
  const workflowColorMap = getWorkflowColorMap_();
  const previewRows = [];
  const unknownColors = {};

  for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < values[rowIndex].length; colIndex += 1) {
      const hexColor = normalizeHex_(backgrounds[rowIndex][colIndex]);
      const workflow = workflowColorMap[hexColor] || null;
      const cell = range.getCell(rowIndex + 1, colIndex + 1);

      if (hexColor && !workflow) {
        unknownColors[hexColor] = (unknownColors[hexColor] || 0) + 1;
      }

      previewRows.push({
        sheetName: GAGA_CONFIG.cockpitSheetName,
        cellA1: cell.getA1Notation(),
        value: values[rowIndex][colIndex],
        hexColor: hexColor,
        statusCode: workflow ? workflow.statusCode : '',
        statusLabel: workflow ? workflow.label : '',
        responsibleRole: workflow ? workflow.responsibleRole : '',
        knownColor: Boolean(workflow)
      });
    }
  }

  const preview = {
    mode: 'dry-run',
    cockpitSpreadsheetId: GAGA_CONFIG.cockpitSpreadsheetId,
    databaseSpreadsheetId: GAGA_CONFIG.databaseSpreadsheetId,
    sheetName: GAGA_CONFIG.cockpitSheetName,
    watchedRangeA1: GAGA_CONFIG.watchedRangeA1,
    rows: values.length,
    cols: values[0] ? values[0].length : 0,
    scannedCells: previewRows.length,
    mappedCells: previewRows.filter(function (row) {
      return row.knownColor;
    }).length,
    unknownColors: unknownColors,
    preview: previewRows
  };

  Logger.log(JSON.stringify(preview, null, 2));
  return preview;
}

function syncColorsToDatabase() {
  const preview = syncCockpitColorsToDatabaseDryRun();

  // TODO Release 0.2B:
  // Compare dry-run rows against 07_TASK_SNAPSHOT.
  // Append status transitions to 08_CHANGE_LOG.
  // Update 07_TASK_SNAPSHOT with current machine-readable state.
  // Optionally write SYSTEM_ALERTS or Discord admin alerts for unknown colors.

  return preview;
}

function rebuildTaskSnapshot() {
  // TODO Release 0.2B: full rebuild from Sheet 1 into Sheet 2 snapshot.
  syncColorsToDatabase();
}
