const mongoose = require("mongoose");

const userVerifySchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: { type: String },
    salt: { type: String },
    verifyToken: { type: String },
    forgotPassword: { type: mongoose.Schema.Types.Boolean, default: false },
    expireAt: {
      type: Date,
      default: new Date(),
      expires: 600,
    },
  },
  { timestamps: true }
);

const VerifyUser = mongoose.model("VerifyUser", userVerifySchema);

module.exports = VerifyUser;
