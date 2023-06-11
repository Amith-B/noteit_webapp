function verifyNotes(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  if (!Array.isArray(obj.folders)) {
    return false;
  }

  for (const folder of obj.folders) {
    if (
      typeof folder !== "object" ||
      typeof folder._id !== "string" ||
      typeof folder.folderName !== "string" ||
      !Array.isArray(folder.notes) ||
      typeof folder.activeNoteId !== "string"
    ) {
      return false;
    }

    for (const note of folder.notes) {
      if (
        typeof note !== "object" ||
        typeof note._id !== "string" ||
        typeof note.content !== "string" ||
        typeof note.title !== "string"
      ) {
        return false;
      }
    }
  }

  return true;
}

module.exports = verifyNotes;
