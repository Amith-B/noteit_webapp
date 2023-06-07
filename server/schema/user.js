const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  picture: String,
  folders: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: [] },
  ],
  activeFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
