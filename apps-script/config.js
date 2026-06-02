/**
 * GAGA Cockpit Apps Script configuration.
 *
 * Release 0.2A keeps the real spreadsheet IDs in one source file so every
 * Apps Script module can reference the same contract. Later production
 * hardening should migrate these values into Script Properties without
 * changing downstream callers.
 */

const COCKPIT_SPREADSHEET_ID = '15kYRb_2GVMvlvhVEpc-OEd98OmWbnOzoIwDX84-JJ3Q';
const DATABASE_SPREADSHEET_ID = '1wUZinkzQKN4FZ-dmzuERHrSTRRssH_I5cm3Qvsmgm8k';

const CELL_STATE_COLORS = {
  '#000000': {
    stateCode: 'N_A',
    stateLabel: 'N/A',
    includeInWorkflow: false,
    includeInSnapshot: false
  },
  '#ffffff': {
    stateCode: 'BLANK',
    stateLabel: 'Blank',
    includeInWorkflow: false,
    includeInSnapshot: false
  }
};

const DRY_RUN_PREVIEW_LIMIT = 25;
const DRY_RUN_INCLUDE_CELL_STATE_PREVIEW = false;
const BLOCK_SYNC_ON_UNKNOWN_COLORS = true;
const SYNC_LOCK_TIMEOUT_MS = 30000;
const PERFORMANCE_LOG_ENABLED = true;
const DRY_RUN_PERFORMANCE_LOG_ENABLED = false;
const SNAPSHOT_BACKUP_ENABLED = true;
const SNAPSHOT_BACKUP_TAB_NAME = '11_SNAPSHOT_BACKUP';
const APPS_SCRIPT_READ_TOKEN_PROPERTY = 'GAGA_APPS_SCRIPT_READ_TOKEN';

const GAGA_CONFIG = {
  cockpitSpreadsheetId: COCKPIT_SPREADSHEET_ID,
  databaseSpreadsheetId: DATABASE_SPREADSHEET_ID,
  cockpitSheetName: 'ⓒ 2025 Gaga',
  watchedRangeA1: 'D1:N200',
  cellStateColors: CELL_STATE_COLORS,
  dryRunPreviewLimit: DRY_RUN_PREVIEW_LIMIT,
  dryRunIncludeCellStatePreview: DRY_RUN_INCLUDE_CELL_STATE_PREVIEW,
  blockSyncOnUnknownColors: BLOCK_SYNC_ON_UNKNOWN_COLORS,
  syncLockTimeoutMs: SYNC_LOCK_TIMEOUT_MS,
  performanceLogEnabled: PERFORMANCE_LOG_ENABLED,
  dryRunPerformanceLogEnabled: DRY_RUN_PERFORMANCE_LOG_ENABLED,
  snapshotBackupEnabled: SNAPSHOT_BACKUP_ENABLED,
  appsScriptReadTokenProperty: APPS_SCRIPT_READ_TOKEN_PROPERTY,
  tabs: {
    users: '01_USERS',
    projects: '02_PROJECTS',
    taskTemplates: '03_TASK_TEMPLATES',
    workflowColors: '04_WORKFLOW_COLORS',
    roleRouting: '05_ROLE_ROUTING',
    sheetLayoutRegistry: '06_SHEET_LAYOUT_REGISTRY',
    taskSnapshot: '07_TASK_SNAPSHOT',
    changeLog: '08_CHANGE_LOG',
    performanceLog: '09_PERFORMANCE_LOG',
    systemConfig: '10_SYSTEM_CONFIG',
    snapshotBackup: SNAPSHOT_BACKUP_TAB_NAME
  }
};
