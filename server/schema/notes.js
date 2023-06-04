const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: String,
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
