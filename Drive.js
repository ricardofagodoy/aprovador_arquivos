class Drive {

  static findNewFilesInFolder(folderId, lastTimestamp) {

    // Fetch new drive activity on folder
    const activities = DriveActivity.Activity.query({
      ancestorName: "items/" + folderId,
      filter: "detail.action_detail_case:(CREATE) time > " + lastTimestamp
    }).activities

    // Process activities
    if (!activities || activities.length === 0) {
      Logger.log('No new actities on folder.')
      return []
    }

    // Return ID of items with activities
    return activities.flatMap(a => a.targets.map(t => t.driveItem.name.split('/')[1]))
  }

  static findFile(id) {
    return DriveApp.getFileById(id)
  }

  static moveFileTo(fileId, folderId) {
    return DriveApp.getFileById(fileId).moveTo(DriveApp.getFolderById(folderId))
  }

  static createFolder(name, parentId) {
    return DriveApp.getFolderById(parentId).createFolder(name).getId()
  }

  static findParentFolderId(fileId) {
    return DriveApp.getFileById(fileId).getParents().next().getId()
  }
}