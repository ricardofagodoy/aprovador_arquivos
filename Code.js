/* 
  Ricardo Godoy (ricardofagodoy@gmail.com)
  Abril/2024
  Uso e distribuição livre
*/

function processApprovalChange(e) {

  const sheet = SpreadsheetApp.getActiveSheet()

  // If it's a change on "Status" only  
  if (e.range.columnStart == FILE_DATA.fields.status + 1 &&
    e.range.columnEnd == FILE_DATA.fields.status + 1 &&
    sheet.getName() == MAIN_SHEET) {

    // Proccess both scenarios
    const configs = new Configs()

    const fileRow = sheet.getRange(FILE_DATA.range.replaceAll('$', e.range.rowStart)).getValues()[0]
    const configRow = configs.findConfig(fileRow[FILE_DATA.fields.config])
    const approver = e.user.email

    Logger.log(`Processing "${e.value}" to ${fileRow[FILE_DATA.fields.fileId]}...`)

    // Send emails (to owner and registered email) and move file to approved folder
    if (e.value == "Aprovado") {
      const movedFile = Drive.moveFileTo(fileRow[FILE_DATA.fields.fileId], configRow[configs.field('Allow')])
      const subject = MESSAGES.approvedSubject.replace('$NAME', movedFile.getName())
      const body = MESSAGES.approvedBody
        .replace('$LINK', movedFile.getUrl())
        .replace('$APPROVER', approver)

      Email.sendEmail(fileRow[FILE_DATA.fields.owner], subject, body)
      Email.sendEmail(configRow[configs.field('Email')], subject, body)
    }

    // Send email (to owner only) with message, and move file to rejected
    else if (e.value == "Rejeitado") {
      const movedFile = Drive.moveFileTo(fileRow[FILE_DATA.fields.fileId], configRow[configs.field('Deny')])
      const subject = MESSAGES.rejectedSubject.replace('$NAME', movedFile.getName())
      const body = MESSAGES.rejectedBody
        .replace('$LINK', movedFile.getUrl())
        .replace('$MESSAGE', fileRow[FILE_DATA.fields.message])
        .replace('$APPROVER', approver)

      Email.sendEmail(fileRow[FILE_DATA.fields.owner], subject, body)
    }
  }
}

function processInputFile(id, configName) {

  Logger.log(`Processing file ${id} for config "${configName}"...`)

  // Find some information about the file
  const file = Drive.findFile(id)
  const sheet = spreadsheet.getSheetByName(MAIN_SHEET)

  // Insert a new row and populate it with new file
  sheet.insertRowBefore(FILE_DATA.topRow)

  // Write the contents!
  const row = FILE_DATA.range.replaceAll('$', FILE_DATA.topRow)
  sheet.getRange(row).setValues([
    [new Date().toLocaleString(), configName, file.getId(), `=HYPERLINK("${file.getUrl()}"; "${file.getName()}")`, file.getOwner().getEmail(), '', '']
  ])

  // Notify approver via email
  Email.sendEmail(
    spreadsheet.getRangeByName(NAMED_RANGES.aprovador).getValue(),
    MESSAGES.newFileSubject.replace('$NAME', file.getName()),
    MESSAGES.newFileBody.replace('$LINK', spreadsheet.getUrl()))
}

function checkDriveFiles() {

  const configs = new Configs()

  // For each config, check for new events on input folder
  for (const config of configs.iterateConfigs()) {

    const configName = config[configs.field('Nome')]
    Logger.log(`Checking for changes on "${configName}"...`)

    // Check and handle new files
    const folderId = config[configs.field('Input')]
    const lastTimestamp = config[configs.field('Timestamp')]

    // Process all new files
    for (const fileId of Drive.findNewFilesInFolder(folderId, lastTimestamp))
      processInputFile(fileId, configName)

    // Update last checked timestamp for now
    config[configs.field('Timestamp')] = new Date().getTime()
    Logger.log(`Timestamp updated for "${configName}"`)
  }

  // Save updated timestamps back
  configs.saveConfigs()
}

function installConfigs() {

  // Define initial "Aprovador" value if empty
  const aprovadorRange = spreadsheet.getRangeByName(NAMED_RANGES.aprovador)
  if (!aprovadorRange.getValue())
    aprovadorRange.setValue(spreadsheet.getOwner().getEmail())

  // Create new config folders
  const configs = new Configs()

  // Find the parent folder to create new folders inside
  const parentId = Drive.findParentFolderId(spreadsheet.getId())

  for (config of configs.iterateConfigs()) {

    // Create folders on drive and save to configs
    Object.entries(FOLDER_NAMES).forEach(([key, folder]) => {

      // If they not already exist
      if (!config[configs.field(key)]) {
        const folderName = `${config[configs.field('Nome')]} ${folder}`

        // Create
        config[configs.field(key)] = Drive.createFolder(folderName, parentId)
        Logger.log(`Folder "${folderName}" created.`)
      }
    })

    // Update timestamp if empty
    if (!config[configs.field('Timestamp')])
      config[configs.field('Timestamp')] = new Date().getTime()

    // Installed this config successfuly
    config[configs.field('Status')] = 'OK'
  }

  // Write updated configs
  configs.saveConfigs()

  // Install time-based trigger
  installPeriodicTrigger(TRIGGER_INTERVAL_MINUTES)

  SpreadsheetApp.getUi().alert("Instalado com sucesso!")
}