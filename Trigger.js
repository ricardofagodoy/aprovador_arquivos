function onOpen(_) {
  SpreadsheetApp.getUi().createMenu('Aprovador')
      .addItem('Instalar', 'installConfigs')
      .addItem('Verificar agora!', 'checkDriveFiles')
      .addToUi();
}

function installPeriodicTrigger(minutes) {

  // Clear all previous triggers to avoid duplication
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t))

  // Installs trigger to look for new files
  ScriptApp.newTrigger("checkDriveFiles")
      .timeBased()
      .everyMinutes(minutes)
      .create()

  // Installs trigger for approve/deny requests
  ScriptApp.newTrigger("processApprovalChange")
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create()
}