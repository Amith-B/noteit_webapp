const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  salt: { type: String },
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
