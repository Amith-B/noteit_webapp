const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  const auth = req.headers.authorization;
  const authToken = auth.replace("Bearer ", "");

  const tokenInfo = jwt.decode(authToken);
  res.send(JSON.stringify(tokenInfo));
});

module.exports = router;
