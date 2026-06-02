/**
 * Sync color state from Sheet 1 to Sheet 2.
 * This is a skeleton. Replace constants with SYSTEM_CONFIG values.
 */

const GAGA_CONFIG = {
  cockpitSheetName: 'ⓒ 2025 Gaga',
  watchedRangeA1: 'D1:N200',
  systemSpreadsheetId: 'PUT_SHEET_2_ID_HERE',
  snapshotSheetName: '07_TASK_SNAPSHOT',
  changeLogSheetName: '08_CHANGE_LOG'
};

function syncColorsToDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cockpit = ss.getSheetByName(GAGA_CONFIG.cockpitSheetName);
  if (!cockpit) throw new Error('Cockpit sheet not found.');

  const range = cockpit.getRange(GAGA_CONFIG.watchedRangeA1);
  const values = range.getValues();
  const backgrounds = range.getBackgrounds();

  // TODO:
  // 1. Load previous snapshot from Sheet 2.
  // 2. Compare backgrounds.
  // 3. Map hex to workflow status.
  // 4. Append change log.
  // 5. Update task snapshot.
  // 6. Trigger Discord webhook if needed.

  Logger.log(JSON.stringify({
    rows: values.length,
    cols: values[0] ? values[0].length : 0,
    note: 'sync skeleton executed'
  }));
}

function rebuildTaskSnapshot() {
  // Full rebuild from Sheet 1.
  syncColorsToDatabase();
}
