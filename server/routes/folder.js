const express = require("express");
const router = express.Router();

// model
const Folder = require("../schema/folder");
const User = require("../schema/user");

router.get("/", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;

  const user = await User.findById(userId).populate("folderIds");

  res.send(JSON.stringify(user.folderIds));
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
  newFolder.save();

  await User.findByIdAndUpdate(userId, {
    $push: { folderIds: newFolder.id },
  });

  res.send(JSON.stringify(newFolder));
});

router.delete("/:folderId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { folderId } = req.params;

  if (!folderId) {
    res.status(400).json({ message: "Bad Request, folder id required" });
    return;
  }

  try {
    const deletedFolder = await Folder.findOneAndDelete({
      _id: folderId,
      userId,
    });

    if (!deletedFolder) {
      res.status(400).json({ message: "Bad Request, invalid folder" });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { folderIds: deletedFolder.id },
    });

    res.send(JSON.stringify(deletedFolder));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to delete" });
  }
});

router.patch("/:folderId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { newFolderName } = req.body;
  const { folderId } = req.params;

  if (!folderId) {
    res.status(400).json({ message: "Bad Request, folder id required" });
    return;
  }

  if (!newFolderName) {
    res.status(400).json({ message: "Bad Request, new folder name required" });
    return;
  }

  try {
    const updatedFolder = await Folder.findOneAndUpdate(
      { _id: folderId, userId },
      {
        $set: { folderName: newFolderName },
      },
      { new: true }
    );

    if (!updatedFolder) {
      res.status(400).json({ message: "Bad Request, invalid folder" });
      return;
    }

    res.send(JSON.stringify(updatedFolder));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to rename" });
  }
});

module.exports = router;
