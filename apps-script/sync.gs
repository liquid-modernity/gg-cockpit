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
  const cellStateColorMap = getCellStateColorMap_();
  const workflowMappedCells = [];
  const unknownCells = [];
  const cellStateCells = [];
  const workflowColors = {};
  const cellStateColors = {};
  const unknownColors = {};

  for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < values[rowIndex].length; colIndex += 1) {
      const hexColor = normalizeHex_(backgrounds[rowIndex][colIndex]);
      const workflow = workflowColorMap[hexColor] || null;
      const cellState = cellStateColorMap[hexColor] || null;
      const cell = range.getCell(rowIndex + 1, colIndex + 1);
      const baseCell = {
        sheetName: GAGA_CONFIG.cockpitSheetName,
        cellA1: cell.getA1Notation(),
        value: values[rowIndex][colIndex],
        hexColor: hexColor
      };

      if (workflow) {
        incrementColorSummary_(workflowColors, hexColor, {
          statusCode: workflow.statusCode,
          label: workflow.label,
          responsibleRole: workflow.responsibleRole
        });

        workflowMappedCells.push(Object.assign({}, baseCell, {
          statusCode: workflow.statusCode,
          statusLabel: workflow.label,
          responsibleRole: workflow.responsibleRole,
          knownColor: true,
          workflowColor: true
        }));
        continue;
      }

      if (cellState) {
        incrementColorSummary_(cellStateColors, hexColor, {
          stateCode: cellState.stateCode,
          stateLabel: cellState.stateLabel
        });

        cellStateCells.push(Object.assign({}, baseCell, {
          stateCode: cellState.stateCode,
          stateLabel: cellState.stateLabel,
          knownColor: true,
          workflowColor: false
        }));
        continue;
      }

      incrementColorSummary_(unknownColors, hexColor, {});
      unknownCells.push(Object.assign({}, baseCell, {
        knownColor: false,
        workflowColor: false
      }));
    }
  }

  const summary = {
    mode: 'dry-run',
    cockpitSpreadsheetId: GAGA_CONFIG.cockpitSpreadsheetId,
    databaseSpreadsheetId: GAGA_CONFIG.databaseSpreadsheetId,
    sheetName: GAGA_CONFIG.cockpitSheetName,
    watchedRangeA1: GAGA_CONFIG.watchedRangeA1,
    rows: values.length,
    cols: values[0] ? values[0].length : 0,
    scannedCells: values.length * (values[0] ? values[0].length : 0),
    workflowMappedCells: workflowMappedCells.length,
    cellStateMappedCells: cellStateCells.length,
    unknownCells: unknownCells.length,
    workflowColors: workflowColors,
    cellStateColors: cellStateColors,
    unknownColors: unknownColors
  };

  const preview = {
    summary: summary,
    previewLimit: GAGA_CONFIG.dryRunPreviewLimit,
    workflowMappedCells: workflowMappedCells.slice(0, GAGA_CONFIG.dryRunPreviewLimit),
    unknownCells: unknownCells.slice(0, GAGA_CONFIG.dryRunPreviewLimit)
  };

  if (GAGA_CONFIG.dryRunIncludeCellStatePreview) {
    preview.cellStateCells = cellStateCells.slice(0, GAGA_CONFIG.dryRunPreviewLimit);
  }

  Logger.log('GAGA dry-run summary\n' + JSON.stringify(summary, null, 2));
  Logger.log('GAGA workflow mapped sample\n' + JSON.stringify(preview.workflowMappedCells, null, 2));
  Logger.log('GAGA unknown sample\n' + JSON.stringify(preview.unknownCells, null, 2));
  Logger.log('GAGA cell state summary\n' + JSON.stringify(summary.cellStateColors, null, 2));

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

function getCellStateColorMap_() {
  const colorMap = {};
  Object.keys(GAGA_CONFIG.cellStateColors).forEach(function (hexColor) {
    colorMap[normalizeHex_(hexColor)] = GAGA_CONFIG.cellStateColors[hexColor];
  });
  return colorMap;
}

function incrementColorSummary_(summary, hexColor, metadata) {
  const normalizedHex = normalizeHex_(hexColor);
  if (!summary[normalizedHex]) {
    summary[normalizedHex] = Object.assign({ count: 0 }, metadata);
  }
  summary[normalizedHex].count += 1;
}
