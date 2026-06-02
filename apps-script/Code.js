/**
 * GAGA Apps Script entrypoints.
 * Sheet 1 = operational cockpit.
 * Sheet 2 = system database.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GAGA SYSTEM')
    .addItem('Bootstrap database', 'bootstrapGagaCockpitDatabase')
    .addItem('Validate database', 'validateGagaCockpitDatabase')
    .addItem('Dry-run color sync', 'syncCockpitColorsToDatabaseDryRun')
    .addItem('Sync colors to database', 'syncCockpitColorsToDatabase')
    .addItem('Rebuild task snapshot', 'rebuildTaskSnapshot')
    .addItem('Validate structure', 'validateStructure')
    .addItem('Repair formatting from template', 'repairFormattingFromTemplate')
    .addToUi();
}

function validateStructure() {
  SpreadsheetApp.getUi().alert('TODO: validate Sheet 1 structure against Sheet 2 registry.');
}

function repairFormattingFromTemplate() {
  SpreadsheetApp.getUi().alert('TODO: repair selected row/column formatting from template.');
}
