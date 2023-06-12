const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// models
const Folder = require("../schema/folder");
const Note = require("../schema/notes");
const User = require("../schema/user");

const verifyNotes = require("../utils/verifyNotes");
const { encrypt, decrypt } = require("../utils/encrypt");

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

  const valid = verifyNotes(notes);

  if (!valid) {
    res.status(400).json({ error: "Invalid json", code: "INVALID_JSON" });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const folder of notes.folders) {
      const newFolder = await new Folder({
        folderName: folder.folderName,
        userId,
      });

      await newFolder.save({ session });

      for (const { title, content, _id } of folder.notes) {
        const { iv, encryptedData } = encrypt(content);

        const newNote = await new Note({
          title,
          content: encryptedData,
          iv,
          userId,
          folderId: newFolder._id,
        });
        await newNote.save({ session });

        await newFolder.updateOne(
          {
            $push: { notes: newNote.id },
            ...(_id === folder.activeNoteId && {
              $set: { activeNoteId: newNote.id },
            }),
          },
          { session }
        );
      }

      await User.findByIdAndUpdate(
        userId,
        {
          $push: { folders: newFolder.id },
        },
        { session }
      );

      if (notes.activeFolder === folder._id) {
        await User.findByIdAndUpdate(
          userId,
          {
            $set: { activeFolder: newFolder._id },
          },
          { session }
        );
      }
    }

    await session.commitTransaction();

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

    const decryptedData = {
      ...folderData.toJSON(),
    };

    if (decryptedData.activeFolder) {
      decryptedData.activeFolder.notes = decryptedData.activeFolder.notes.map(
        (note) => ({
          ...note,
          content: decrypt(note.content, note.iv),
        })
      );
    }

    res.send(JSON.stringify(decryptedData));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Upload failed", code: "UPLOAD_FAILED" });
  }
});

router.delete("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { noteId } = req.params;

  if (!noteId) {
    res.status(400).json({ error: "Bad Request, note id required" });
    return;
  }

  try {
    const deletedNotes = await Note.findOneAndDelete({
      _id: noteId,
      userId,
    });

    if (!deletedNotes) {
      res.status(400).json({ error: "Bad Request, invalid notes" });
      return;
    }

    await Folder.findByIdAndUpdate(deletedNotes.folderId, {
      $pull: { notes: deletedNotes._id },
    });

    res.send(JSON.stringify(deletedNotes));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error, Unable to delete" });
  }
});

router.post("/:folderId/add", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { title, content } = req.body;
  const { folderId } = req.params;

  try {
    const folder = await Folder.findOne({ _id: folderId, userId });

    if (!folder) {
      res.status(400).json({ error: "Bad Request, invalid folder" });
      return;
    }

    const { iv, encryptedData } = encrypt(content);

    const newNote = await new Note({
      title,
      content: encryptedData,
      iv,
      userId,
      folderId,
    });
    newNote.save();

    await folder.updateOne({
      $push: { notes: newNote.id },
      $set: { activeNoteId: newNote.id },
    });

    res.send(JSON.stringify({ ...newNote.toJSON(), content }));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Unable to add note" });
  }
});

router.patch("/activenote", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { activeNoteId } = req.body;

  if (!activeNoteId) {
    res.status(400).json({ error: "Bad Request, activeNoteId required" });
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
      res.status(400).json({ error: "Bad Request, invalid folder" });
      return;
    }

    res.send(JSON.stringify(updatedFolder));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Unable to set active note" });
  }
});

router.patch("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { title, content } = req.body;
  const { noteId } = req.params;

  if (!noteId) {
    res.status(400).json({ error: "Bad Request, note id required" });
    return;
  }

  try {
    const { iv, encryptedData } = encrypt(content);

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      {
        $set: { title, iv, content: encryptedData },
      },
      { new: true }
    );

    if (!updatedNote) {
      res.status(400).json({ error: "Bad Request, invalid notes" });
      return;
    }

    res.send(JSON.stringify(updatedNote));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error, Unable to rename" });
  }
});

module.exports = router;
