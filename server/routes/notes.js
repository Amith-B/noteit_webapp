const express = require("express");
const router = express.Router();

// models
const Folder = require("../schema/folder");
const Note = require("../schema/notes");
const User = require("../schema/user");

router.get("/getall", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;

  const notes = await User.findById(userId)
    .select("folders activeFolder")
    .populate({
      path: "folders",
      populate: { path: "notes" },
    });

  res.send(JSON.stringify(notes));
});

router.post("/upload", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const notes = req.body;

  // TODO: handle upload with verification

  res.send(JSON.stringify({ uploaded: true, notes }));
});

router.get("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { noteId } = req.params;

  try {
    const notes = await Note.findOne({
      _id: noteId,
      userId,
    });
    if (!notes) {
      res.status(400).json({ message: "Bad Request, invalid notes" });
      return;
    }

    res.send(JSON.stringify(notes));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error, unable to fetch note" });
  }
});

router.delete("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { noteId } = req.params;

  if (!noteId) {
    res.status(400).json({ message: "Bad Request, note id required" });
    return;
  }

  try {
    const deletedNotes = await Note.findOneAndDelete({
      _id: noteId,
      userId,
    });

    if (!deletedNotes) {
      res.status(400).json({ message: "Bad Request, invalid notes" });
      return;
    }

    await Folder.findByIdAndUpdate(deletedNotes.folderId, {
      $pull: { notes: deletedNotes._id },
    });

    res.send(JSON.stringify(deletedNotes));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to delete" });
  }
});

router.post("/:folderId/add", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { title, content } = req.body;
  const { folderId } = req.params;

  try {
    const folder = await Folder.findOne({ _id: folderId, userId });

    if (!folder) {
      res.status(400).json({ message: "Bad Request, invalid folder" });
      return;
    }

    const newNote = await new Note({
      title,
      content,
      userId,
      folderId,
    });
    newNote.save();

    await folder.updateOne({
      $push: { notes: newNote.id },
      $set: { activeNoteId: newNote.id },
    });

    res.send(JSON.stringify(newNote));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to add note" });
  }
});

router.patch("/activenote", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { activeNoteId } = req.body;

  if (!activeNoteId) {
    res.status(400).json({ message: "Bad Request, activeNoteId required" });
    return;
  }

  try {
    const note = await Note.findOne({ _id: activeNoteId, userId });
    const updatedFolder = await Folder.findOneAndUpdate(
      { _id: note.folderId, userId },
      {
        $set: { activeNoteId: note._id },
      }
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
      .json({ message: "Internal Server Error, Unable to set active note" });
  }
});

router.patch("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { title, content } = req.body;
  const { noteId } = req.params;

  if (!noteId) {
    res.status(400).json({ message: "Bad Request, note id required" });
    return;
  }

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      {
        $set: { title, content },
      },
      { new: true }
    );

    if (!updatedNote) {
      res.status(400).json({ message: "Bad Request, invalid notes" });
      return;
    }

    res.send(JSON.stringify(updatedNote));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to rename" });
  }
});

module.exports = router;
