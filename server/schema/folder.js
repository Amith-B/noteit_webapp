const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  folderName: String,
  activeNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  noteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note", default: [] }],
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
