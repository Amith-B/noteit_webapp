const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(JSON.stringify({ message: res.locals.tokenData }));
});

module.exports = router;
