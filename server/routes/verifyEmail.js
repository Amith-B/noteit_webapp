const express = require("express");
const { sendForgotPasswordMail } = require("../utils/sendMail");
const router = express.Router();

// models
const VerifyUser = require("../schema/userVerify");
const User = require("../schema/user");

router.get("/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await VerifyUser.findOne({
      verifyToken: token,
    });

    if (!user) {
      res.send("<h3>Verification link expired</h3>");
      return;
    }

    const verifiedUser = user.toJSON();

    if (!verifiedUser.forgotPassword) {
      const confirmedUser = new User({
        email: verifiedUser.email,
        password: verifiedUser.password,
        salt: verifiedUser.salt,
      });

      await confirmedUser.save();

      await user.deleteOne();

      res.send(`
      <h3>Email verified successfully</h3><br/>
      <a target="__self" href=${process.env.HOST_URL}>Login</a>
      `);
    }
  } catch (error) {
    res.send("<h3>Unable to verify email</h3>");
  }
});

module.exports = router;
