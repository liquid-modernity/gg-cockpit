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
  const startedAt = new Date();
  let scan = null;
  let counters = createEmptySyncCounters_();
  let status = 'success';
  let errorMessage = '';
  let performanceLogAppendResult = 'not_attempted';
  let lock = null;
  let lockAcquired = false;

  if (dryRun) {
    scan = scanCockpitColors_();
    counters = createSyncCounters_(scan);
    const preview = buildDryRunPreview_(scan);
    if (GAGA_CONFIG.dryRunPerformanceLogEnabled) {
      const endedAt = new Date();
      performanceLogAppendResult = appendPerformanceLogSafe_({
        syncRunId: syncRunId,
        mode: 'dry-run',
        startedAt: startedAt,
        endedAt: endedAt,
        status: status,
        errorMessage: errorMessage,
        scan: scan,
        counters: counters
      });
      Logger.log('GAGA dry-run performance log append result: ' + performanceLogAppendResult);
    }
    return preview;
  }

  Logger.log('GAGA actual sync started');

  try {
    scan = scanCockpitColors_();
    counters = createSyncCounters_(scan);

    Logger.log('GAGA actual sync preflight summary\n' + JSON.stringify({
      syncRunId: syncRunId,
      scannedCells: scan.summary.scannedCells,
      workflowMappedCells: scan.workflowMappedCells.length,
      cellStateMappedCells: scan.cellStateCells.length,
      unknownCells: scan.unknownCells.length,
      unknownColors: scan.summary.unknownColors
    }, null, 2));

    lock = LockService.getScriptLock();
    lockAcquired = lock.tryLock(GAGA_CONFIG.syncLockTimeoutMs);

    if (!lockAcquired) {
      throw new Error('GAGA sync lock could not be acquired within ' + GAGA_CONFIG.syncLockTimeoutMs + 'ms.');
    }

    Logger.log('GAGA actual sync lock acquired\n' + JSON.stringify({
      syncRunId: syncRunId,
      lockAcquired: true,
      timeoutMs: GAGA_CONFIG.syncLockTimeoutMs
    }, null, 2));

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

    if (GAGA_CONFIG.snapshotBackupEnabled) {
      counters.backupRowCount = backupTaskSnapshot_(database, snapshotSheet, snapshotHeaders, syncRunId, new Date().toISOString());
    }

    Logger.log('GAGA actual sync backup\n' + JSON.stringify({
      syncRunId: syncRunId,
      backupEnabled: GAGA_CONFIG.snapshotBackupEnabled,
      backupRowCount: counters.backupRowCount
    }, null, 2));

    const existingSnapshots = readRowsByKey_(snapshotSheet, snapshotHeaders, 'snapshot_id');
    const nowIso = new Date().toISOString();
    const snapshotRowsToAppend = [];
    const changeRowsToAppend = [];
    const snapshotRowsToUpdate = [];

    scan.workflowMappedCells.forEach(function (cell) {
      const previous = existingSnapshots[cell.snapshotId] || null;
      const snapshotRecord = buildSnapshotRecord_(cell, nowIso);

      if (!previous) {
        snapshotRowsToAppend.push(recordToRow_(snapshotRecord, snapshotHeaders));
        changeRowsToAppend.push(recordToRow_(buildChangeLogRecord_(cell, null, 'INSERT', nowIso, syncRunId, changeRowsToAppend.length), changeLogHeaders));
        counters.insertedSnapshotCount += 1;
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
        counters.updatedSnapshotCount += 1;
        return;
      }

      counters.unchangedSnapshotCount += 1;
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

    counters.changeLogAppendCount = changeRowsToAppend.length;

    if (
      scan.workflowMappedCells.length > 0 &&
      counters.insertedSnapshotCount + counters.updatedSnapshotCount + counters.unchangedSnapshotCount === 0
    ) {
      throw new Error('Actual sync saw workflow cells but wrote no snapshot rows.');
    }

    Logger.log('GAGA actual sync write result\n' + JSON.stringify({
      syncRunId: syncRunId,
      insertedSnapshotCount: counters.insertedSnapshotCount,
      updatedSnapshotCount: counters.updatedSnapshotCount,
      unchangedSnapshotCount: counters.unchangedSnapshotCount,
      changeLogAppendCount: counters.changeLogAppendCount
    }, null, 2));
  } catch (error) {
    status = 'failed';
    errorMessage = error && error.message ? error.message : String(error);
    throw error;
  } finally {
    const endedAt = new Date();

    if (GAGA_CONFIG.performanceLogEnabled) {
      performanceLogAppendResult = appendPerformanceLogSafe_({
        syncRunId: syncRunId,
        mode: 'sync',
        startedAt: startedAt,
        endedAt: endedAt,
        status: status,
        errorMessage: errorMessage,
        scan: scan || createEmptyScan_(),
        counters: counters
      });
    }

    Logger.log('GAGA actual sync final status\n' + JSON.stringify({
      syncRunId: syncRunId,
      lockAcquired: lockAcquired,
      backupRowCount: counters.backupRowCount,
      insertedSnapshotCount: counters.insertedSnapshotCount,
      updatedSnapshotCount: counters.updatedSnapshotCount,
      unchangedSnapshotCount: counters.unchangedSnapshotCount,
      changeLogAppendCount: counters.changeLogAppendCount,
      performanceLogAppendResult: performanceLogAppendResult,
      finalStatus: status,
      errorMessage: errorMessage
    }, null, 2));

    if (lockAcquired && lock) {
      lock.releaseLock();
    }
  }

  const summary = buildSyncSummary_(scan || createEmptyScan_(), syncRunId, counters, status);
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

function createSyncCounters_(scan) {
  return {
    backupRowCount: 0,
    insertedSnapshotCount: 0,
    updatedSnapshotCount: 0,
    unchangedSnapshotCount: 0,
    changeLogAppendCount: 0,
    skippedCellStateCount: scan.cellStateCells.length,
    unknownColorCount: scan.unknownCells.length
  };
}

function createEmptySyncCounters_() {
  return {
    backupRowCount: 0,
    insertedSnapshotCount: 0,
    updatedSnapshotCount: 0,
    unchangedSnapshotCount: 0,
    changeLogAppendCount: 0,
    skippedCellStateCount: 0,
    unknownColorCount: 0
  };
}

function createEmptyScan_() {
  return {
    summary: {
      mode: 'scan',
      cockpitSpreadsheetId: GAGA_CONFIG.cockpitSpreadsheetId,
      databaseSpreadsheetId: GAGA_CONFIG.databaseSpreadsheetId,
      sheetName: GAGA_CONFIG.cockpitSheetName,
      watchedRangeA1: GAGA_CONFIG.watchedRangeA1,
      rows: 0,
      cols: 0,
      scannedCells: 0,
      workflowMappedCells: 0,
      cellStateMappedCells: 0,
      unknownCells: 0,
      workflowColors: {},
      cellStateColors: {},
      unknownColors: {}
    },
    workflowMappedCells: [],
    cellStateCells: [],
    unknownCells: []
  };
}

function buildSyncSummary_(scan, syncRunId, counters, status) {
  return Object.assign({}, scan.summary, {
    mode: 'sync',
    syncRunId: syncRunId,
    insertedSnapshotCount: counters.insertedSnapshotCount,
    updatedSnapshotCount: counters.updatedSnapshotCount,
    unchangedSnapshotCount: counters.unchangedSnapshotCount,
    changeLogAppendCount: counters.changeLogAppendCount,
    skippedCellStateCount: counters.skippedCellStateCount,
    unknownColorCount: counters.unknownColorCount,
    backupRowCount: counters.backupRowCount,
    status: status
  });
}

function backupTaskSnapshot_(database, snapshotSheet, snapshotHeaders, syncRunId, backedUpAt) {
  const backupSheet = getOrCreateSheet_(database, GAGA_CONFIG.tabs.snapshotBackup);
  const backupHeaders = ensureHeaders_(backupSheet, getGagaDatabaseDefinition_(GAGA_CONFIG.tabs.snapshotBackup).headers);
  const lastRow = snapshotSheet.getLastRow();
  if (lastRow < 2) return 0;

  const snapshotRows = snapshotSheet.getRange(2, 1, lastRow - 1, snapshotHeaders.length).getValues();
  const backupRows = snapshotRows.map(function (row, index) {
    const record = rowToRecord_(row, snapshotHeaders);
    return recordToRow_({
      backup_id: syncRunId + '_BACKUP_' + String(index + 1).padStart(4, '0'),
      sync_run_id: syncRunId,
      backed_up_at: backedUpAt,
      snapshot_id: record.snapshot_id,
      sheet_name: record.sheet_name,
      cell_a1: record.cell_a1,
      project_code_or_column_header: record.project_code_or_column_header,
      row_number: record.row_number,
      column_number: record.column_number,
      cell_value: record.cell_value,
      hex_color: record.hex_color,
      status_code: record.status_code,
      status_label: record.status_label,
      responsible_role: record.responsible_role,
      last_seen_at: record.last_seen_at,
      source_spreadsheet_id: record.source_spreadsheet_id,
      source_sheet_name: record.source_sheet_name,
      source_range_a1: record.source_range_a1,
      active: record.active
    }, backupHeaders);
  });

  if (backupRows.length > 0) {
    backupSheet
      .getRange(backupSheet.getLastRow() + 1, 1, backupRows.length, backupHeaders.length)
      .setValues(backupRows);
  }

  return backupRows.length;
}

function appendPerformanceLogSafe_(context) {
  try {
    appendPerformanceLog_(context);
    return 'appended';
  } catch (error) {
    Logger.log('GAGA performance log append failed\n' + JSON.stringify({
      syncRunId: context.syncRunId,
      errorMessage: error && error.message ? error.message : String(error)
    }, null, 2));
    return 'failed';
  }
}

function appendPerformanceLog_(context) {
  const database = getDatabaseSpreadsheet_();
  const sheet = getOrCreateSheet_(database, GAGA_CONFIG.tabs.performanceLog);
  const headers = ensureHeaders_(sheet, getGagaDatabaseDefinition_(GAGA_CONFIG.tabs.performanceLog).headers);
  const durationMs = context.endedAt.getTime() - context.startedAt.getTime();
  const summary = context.scan.summary;
  const counters = context.counters;
  const record = {
    sync_run_id: context.syncRunId,
    mode: context.mode,
    started_at: context.startedAt.toISOString(),
    ended_at: context.endedAt.toISOString(),
    duration_ms: durationMs,
    status: context.status,
    sheet_name: summary.sheetName,
    watched_range_a1: summary.watchedRangeA1,
    scanned_cells: summary.scannedCells,
    workflow_mapped_cells: summary.workflowMappedCells,
    cell_state_mapped_cells: summary.cellStateMappedCells,
    unknown_cells: summary.unknownCells,
    inserted_snapshot_count: counters.insertedSnapshotCount,
    updated_snapshot_count: counters.updatedSnapshotCount,
    unchanged_snapshot_count: counters.unchangedSnapshotCount,
    change_log_append_count: counters.changeLogAppendCount,
    skipped_cell_state_count: counters.skippedCellStateCount,
    error_message: context.errorMessage,
    source_spreadsheet_id: GAGA_CONFIG.cockpitSpreadsheetId,
    database_spreadsheet_id: GAGA_CONFIG.databaseSpreadsheetId,
    event_id: context.syncRunId,
    event_at: context.endedAt.toISOString(),
    kpi_event: 'sync_run',
    metadata_json: JSON.stringify({
      backupRowCount: counters.backupRowCount,
      unknownColorCount: counters.unknownColorCount
    })
  };

  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, headers.length)
    .setValues([recordToRow_(record, headers)]);
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
