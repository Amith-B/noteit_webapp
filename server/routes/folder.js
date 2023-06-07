const express = require("express");
const router = express.Router();

// model
const Folder = require("../schema/folder");
const User = require("../schema/user");
const Note = require("../schema/notes");

router.get("/", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;

  const folderData = await User.findById(userId)
    .select("folders activeFolder")
    .populate({
      path: "folders",
      populate: { path: "notes", select: "_id" },
    })
    .populate({
      path: "activeFolder",
      populate: { path: "notes" },
    });

  res.send(JSON.stringify(folderData));
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
    $push: { folders: newFolder.id },
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
      $pull: { folders: deletedFolder.id },
    });

    res.send(JSON.stringify(deletedFolder));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to delete" });
  }
});

router.patch("/activefolder", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { activeFolderId } = req.body;

  if (!activeFolderId) {
    res.status(400).json({ message: "Bad Request, activeFolderId required" });
    return;
  }

  try {
    const folder = await Folder.findById(activeFolderId).populate(
      "notes",
      "title _id"
    );

    if (!folder) {
      res.status(400).json({ message: "Bad Request, invalid folder id" });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $set: { activeFolder: folder._id },
    });

    res.send(JSON.stringify(folder));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to set active folder" });
  }
});

router.patch("/:folderId/activenote", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { activeNoteId } = req.body;
  const { folderId } = req.params;

  if (!folderId) {
    res.status(400).json({ message: "Bad Request, folder id required" });
    return;
  }

  if (!activeNoteId) {
    res.status(400).json({ message: "Bad Request, activeNoteId required" });
    return;
  }

  try {
    const note = await Note.findById(activeNoteId);
    if (!note) {
      res.status(400).json({ message: "Bad Request, invalid note" });
      return;
    }

    await Folder.findOneAndUpdate(
      { _id: folderId, userId },
      {
        $set: { activeNoteId: note._id },
      }
    );

    res.send(JSON.stringify({ activeNoteId: note._id }));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to set active note" });
  }
});

router.patch("/:folderId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { folderName } = req.body;
  const { folderId } = req.params;

  if (!folderId) {
    res.status(400).json({ message: "Bad Request, folder id required" });
    return;
  }

  if (!folderName) {
    res.status(400).json({ message: "Bad Request, new folder name required" });
    return;
  }

  try {
    const updatedFolder = await Folder.findOneAndUpdate(
      { _id: folderId, userId },
      {
        $set: { folderName },
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
