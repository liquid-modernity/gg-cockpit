/**
 * GAGA Apps Script entrypoints.
 * Sheet 1 = operational cockpit.
 * Sheet 2 = system database.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GAGA SYSTEM')
    .addItem('Bootstrap Database', 'bootstrapGagaCockpitDatabase')
    .addItem('Validate Database', 'validateGagaCockpitDatabase')
    .addItem('Dry-run Color Sync', 'syncCockpitColorsToDatabaseDryRun')
    .addItem('Actual Color Sync', 'syncCockpitColorsToDatabase')
    .addItem('Debug Sync Routing', 'debugSyncFunctionRouting')
    .addToUi();
}

function validateStructure() {
  SpreadsheetApp.getUi().alert('TODO: validate Sheet 1 structure against Sheet 2 registry.');
}

function repairFormattingFromTemplate() {
  SpreadsheetApp.getUi().alert('TODO: repair selected row/column formatting from template.');
}
