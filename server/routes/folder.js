const express = require("express");
const router = express.Router();

// folder model
const Folder = require("../schema/folder");

router.get("/", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;

  const folders = await Folder.find({
    userId,
  });

  res.send(JSON.stringify(folders));
});

router.post("/", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { folderName } = req.body;

  if (!folderName) {
    res.status(400).json({ message: "Bad Request, folder name is required" });
    return;
  }

  const newFolder = await new Folder({
    folderName,
    userId,
  });

  res.send(JSON.stringify(newFolder));
});

module.exports = router;
