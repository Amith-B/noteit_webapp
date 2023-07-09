const express = require("express");
const router = express.Router();

router.patch("/:token", async (req, res) => {
  const { token } = req.params;

  if (!token) {
    res
      .status(400)
      .json({ error: "Bad Request, verification token not speicified" });
    return;
  }

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
  });
});

module.exports = router;
