/**
 * Sync color state from Sheet 1 to Sheet 2.
 * Release 0.2B writes workflow colors to Sheet 2 snapshot/log tables.
 */

function syncCockpitColorsToDatabaseDryRun() {
  return runCockpitColorSync_({ dryRun: true });
}

function syncCockpitColorsToDatabase() {
  return runCockpitColorSync_({ dryRun: false });
}

function syncColorsToDatabase() {
  return syncCockpitColorsToDatabase();
}

function rebuildTaskSnapshot() {
  // TODO Release 0.2C: full rebuild should reconcile archived/missing workflow cells.
  return syncCockpitColorsToDatabase();
}

function debugSyncFunctionRouting() {
  const routing = {
    syncCockpitColorsToDatabaseDryRun: {
      dryRun: true,
      calls: 'runCockpitColorSync_({ dryRun: true })'
    },
    syncCockpitColorsToDatabase: {
      dryRun: false,
      calls: 'runCockpitColorSync_({ dryRun: false })'
    },
    syncColorsToDatabase: {
      dryRun: false,
      calls: 'syncCockpitColorsToDatabase()'
    }
  };

  Logger.log('GAGA sync function routing\n' + JSON.stringify(routing, null, 2));
  return routing;
}

function runCockpitColorSync_(options) {
  const dryRun = Boolean(options && options.dryRun);
  const syncRunId = makeSyncRunId_();
  const scan = scanCockpitColors_();

  if (dryRun) {
    return buildDryRunPreview_(scan);
  }

  Logger.log('GAGA actual sync started');

  if (GAGA_CONFIG.blockSyncOnUnknownColors && scan.unknownCells.length > 0) {
    const message = [
      'GAGA sync blocked: unknown colors exist.',
      'unknownCells=' + scan.unknownCells.length,
      'unknownColors=' + JSON.stringify(scan.summary.unknownColors)
    ].join(' ');

    Logger.log('GAGA sync blocked\n' + JSON.stringify({
      syncRunId: syncRunId,
      unknownCells: scan.unknownCells.length,
      unknownColors: scan.summary.unknownColors
    }, null, 2));

    throw new Error(message);
  }

  const database = getDatabaseSpreadsheet_();
  const snapshotSheet = getOrCreateSheet_(database, GAGA_CONFIG.tabs.taskSnapshot);
  const changeLogSheet = getOrCreateSheet_(database, GAGA_CONFIG.tabs.changeLog);
  const snapshotHeaders = ensureHeaders_(snapshotSheet, getGagaDatabaseDefinition_(GAGA_CONFIG.tabs.taskSnapshot).headers);
  const changeLogHeaders = ensureHeaders_(changeLogSheet, getGagaDatabaseDefinition_(GAGA_CONFIG.tabs.changeLog).headers);

  Logger.log('GAGA actual sync write target\n' + JSON.stringify({
    syncRunId: syncRunId,
    dryRun: false,
    workflowMappedCells: scan.workflowMappedCells.length,
    targetSnapshotSheetName: snapshotSheet.getName(),
    targetChangeLogSheetName: changeLogSheet.getName()
  }, null, 2));

  const existingSnapshots = readRowsByKey_(snapshotSheet, snapshotHeaders, 'snapshot_id');
  const nowIso = new Date().toISOString();
  const snapshotRowsToAppend = [];
  const changeRowsToAppend = [];
  const snapshotRowsToUpdate = [];
  let insertedSnapshotCount = 0;
  let updatedSnapshotCount = 0;
  let unchangedSnapshotCount = 0;

  scan.workflowMappedCells.forEach(function (cell) {
    const previous = existingSnapshots[cell.snapshotId] || null;
    const snapshotRecord = buildSnapshotRecord_(cell, nowIso);

    if (!previous) {
      snapshotRowsToAppend.push(recordToRow_(snapshotRecord, snapshotHeaders));
      changeRowsToAppend.push(recordToRow_(buildChangeLogRecord_(cell, null, 'INSERT', nowIso, syncRunId, changeRowsToAppend.length), changeLogHeaders));
      insertedSnapshotCount += 1;
      return;
    }

    if (snapshotChanged_(previous.record, cell)) {
      const nextRow = previous.values.slice();
      applyRecordToRow_(nextRow, snapshotHeaders, snapshotRecord);
      snapshotRowsToUpdate.push({
        rowNumber: previous.rowNumber,
        values: nextRow
      });
      changeRowsToAppend.push(recordToRow_(buildChangeLogRecord_(cell, previous.record, 'UPDATE', nowIso, syncRunId, changeRowsToAppend.length), changeLogHeaders));
      updatedSnapshotCount += 1;
      return;
    }

    unchangedSnapshotCount += 1;
  });

  snapshotRowsToUpdate.forEach(function (rowUpdate) {
    snapshotSheet.getRange(rowUpdate.rowNumber, 1, 1, snapshotHeaders.length).setValues([rowUpdate.values]);
  });

  if (snapshotRowsToAppend.length > 0) {
    snapshotSheet
      .getRange(snapshotSheet.getLastRow() + 1, 1, snapshotRowsToAppend.length, snapshotHeaders.length)
      .setValues(snapshotRowsToAppend);
  }

  if (changeRowsToAppend.length > 0) {
    changeLogSheet
      .getRange(changeLogSheet.getLastRow() + 1, 1, changeRowsToAppend.length, changeLogHeaders.length)
      .setValues(changeRowsToAppend);
  }

  if (
    scan.workflowMappedCells.length > 0 &&
    insertedSnapshotCount + updatedSnapshotCount + unchangedSnapshotCount === 0
  ) {
    throw new Error('Actual sync saw workflow cells but wrote no snapshot rows.');
  }

  Logger.log('GAGA actual sync write result\n' + JSON.stringify({
    syncRunId: syncRunId,
    insertedSnapshotCount: insertedSnapshotCount,
    updatedSnapshotCount: updatedSnapshotCount,
    unchangedSnapshotCount: unchangedSnapshotCount,
    changeLogAppendCount: changeRowsToAppend.length
  }, null, 2));

  const summary = Object.assign({}, scan.summary, {
    mode: 'sync',
    syncRunId: syncRunId,
    insertedSnapshotCount: insertedSnapshotCount,
    updatedSnapshotCount: updatedSnapshotCount,
    unchangedSnapshotCount: unchangedSnapshotCount,
    changeLogAppendCount: changeRowsToAppend.length,
    skippedCellStateCount: scan.cellStateCells.length,
    unknownColorCount: scan.unknownCells.length
  });

  Logger.log('GAGA sync summary\n' + JSON.stringify(summary, null, 2));
  return summary;
}

function scanCockpitColors_() {
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
  const startRow = range.getRow();
  const startColumn = range.getColumn();
  const headerValues = values[0] || [];

  for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < values[rowIndex].length; colIndex += 1) {
      const hexColor = normalizeHex_(backgrounds[rowIndex][colIndex]);
      const workflow = workflowColorMap[hexColor] || null;
      const cellState = cellStateColorMap[hexColor] || null;
      const cell = range.getCell(rowIndex + 1, colIndex + 1);
      const cellA1 = cell.getA1Notation();
      const rowNumber = startRow + rowIndex;
      const columnNumber = startColumn + colIndex;
      const columnHeader = String(headerValues[colIndex] || '').trim();
      const baseCell = {
        sheetName: GAGA_CONFIG.cockpitSheetName,
        cellA1: cellA1,
        projectCodeOrColumnHeader: columnHeader,
        rowNumber: rowNumber,
        columnNumber: columnNumber,
        cellValue: values[rowIndex][colIndex],
        hexColor: hexColor,
        sourceSpreadsheetId: GAGA_CONFIG.cockpitSpreadsheetId,
        sourceSheetName: GAGA_CONFIG.cockpitSheetName,
        sourceRangeA1: GAGA_CONFIG.watchedRangeA1
      };

      if (workflow) {
        incrementColorSummary_(workflowColors, hexColor, {
          statusCode: workflow.statusCode,
          label: workflow.label,
          responsibleRole: workflow.responsibleRole
        });

        workflowMappedCells.push(Object.assign({}, baseCell, {
          snapshotId: makeSnapshotId_(GAGA_CONFIG.cockpitSpreadsheetId, GAGA_CONFIG.cockpitSheetName, cellA1),
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
    mode: 'scan',
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

  return {
    summary: summary,
    workflowMappedCells: workflowMappedCells,
    cellStateCells: cellStateCells,
    unknownCells: unknownCells
  };
}

function buildDryRunPreview_(scan) {
  const summary = Object.assign({}, scan.summary, { mode: 'dry-run' });
  const preview = {
    summary: summary,
    previewLimit: GAGA_CONFIG.dryRunPreviewLimit,
    workflowMappedCells: scan.workflowMappedCells.slice(0, GAGA_CONFIG.dryRunPreviewLimit),
    unknownCells: scan.unknownCells.slice(0, GAGA_CONFIG.dryRunPreviewLimit)
  };

  if (GAGA_CONFIG.dryRunIncludeCellStatePreview) {
    preview.cellStateCells = scan.cellStateCells.slice(0, GAGA_CONFIG.dryRunPreviewLimit);
  }

  Logger.log('GAGA dry-run summary\n' + JSON.stringify(summary, null, 2));
  Logger.log('GAGA workflow mapped sample\n' + JSON.stringify(preview.workflowMappedCells, null, 2));
  Logger.log('GAGA unknown sample\n' + JSON.stringify(preview.unknownCells, null, 2));
  Logger.log('GAGA cell state summary\n' + JSON.stringify(summary.cellStateColors, null, 2));

  return preview;
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

function buildSnapshotRecord_(cell, nowIso) {
  return {
    snapshot_id: cell.snapshotId,
    sheet_name: cell.sheetName,
    cell_a1: cell.cellA1,
    project_code_or_column_header: cell.projectCodeOrColumnHeader,
    row_number: cell.rowNumber,
    column_number: cell.columnNumber,
    cell_value: cell.cellValue,
    hex_color: cell.hexColor,
    status_code: cell.statusCode,
    status_label: cell.statusLabel,
    responsible_role: cell.responsibleRole,
    last_seen_at: nowIso,
    source_spreadsheet_id: cell.sourceSpreadsheetId,
    source_sheet_name: cell.sourceSheetName,
    source_range_a1: cell.sourceRangeA1,
    active: 'TRUE'
  };
}

function buildChangeLogRecord_(cell, previousRecord, changeType, nowIso, syncRunId, index) {
  return {
    change_id: syncRunId + '_' + String(index + 1).padStart(4, '0'),
    changed_at: nowIso,
    sheet_name: cell.sheetName,
    cell_a1: cell.cellA1,
    previous_status_code: previousRecord ? previousRecord.status_code : '',
    new_status_code: cell.statusCode,
    previous_hex_color: previousRecord ? previousRecord.hex_color : '',
    new_hex_color: cell.hexColor,
    cell_value: cell.cellValue,
    responsible_role: cell.responsibleRole,
    change_type: changeType,
    source_spreadsheet_id: cell.sourceSpreadsheetId,
    sync_run_id: syncRunId,
    source: 'apps_script_sync',
    old_hex_color: previousRecord ? previousRecord.hex_color : '',
    old_status_code: previousRecord ? previousRecord.status_code : '',
    notification_status: 'not_sent'
  };
}

function snapshotChanged_(previousRecord, cell) {
  return normalizeHex_(previousRecord.hex_color) !== cell.hexColor ||
    String(previousRecord.status_code || '') !== String(cell.statusCode || '') ||
    String(previousRecord.status_label || '') !== String(cell.statusLabel || '') ||
    String(previousRecord.responsible_role || '') !== String(cell.responsibleRole || '') ||
    String(previousRecord.cell_value || '') !== String(cell.cellValue || '');
}

function readRowsByKey_(sheet, headers, keyHeader) {
  const lastRow = sheet.getLastRow();
  const rowsByKey = {};
  if (lastRow < 2) return rowsByKey;

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const keyIndex = headers.indexOf(keyHeader);
  if (keyIndex === -1) throw new Error('Missing required key header: ' + keyHeader);

  values.forEach(function (row, index) {
    const key = String(row[keyIndex] || '').trim();
    if (!key) return;

    rowsByKey[key] = {
      rowNumber: index + 2,
      values: row,
      record: rowToRecord_(row, headers)
    };
  });

  return rowsByKey;
}

function rowToRecord_(row, headers) {
  const record = {};
  headers.forEach(function (header, index) {
    if (header) record[header] = row[index];
  });
  return record;
}

function recordToRow_(record, headers) {
  return headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(record, header) ? record[header] : '';
  });
}

function applyRecordToRow_(row, headers, record) {
  headers.forEach(function (header, index) {
    if (Object.prototype.hasOwnProperty.call(record, header)) {
      row[index] = record[header];
    }
  });
}

function makeSyncRunId_() {
  return 'SYNC_' + Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyyMMdd_HHmmss') + '_' + Utilities.getUuid().slice(0, 8);
}

function makeSnapshotId_(sourceSpreadsheetId, sheetName, cellA1) {
  // TODO Release 0.3: replace A1-based identity with Developer Metadata and 06_SHEET_LAYOUT_REGISTRY.
  const rawKey = [sourceSpreadsheetId, sheetName, cellA1].join('|');
  return 'SNAPSHOT_' + digestHex_(rawKey).slice(0, 24);
}

function digestHex_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  return digest.map(function (byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ('0' + unsigned.toString(16)).slice(-2);
  }).join('');
}
