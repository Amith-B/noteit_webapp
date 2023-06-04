const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: String,
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
  title: String,
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
