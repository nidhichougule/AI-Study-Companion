const Note = require("../models/Note");
const { deleteChunksByNoteId } = require("../services/vectorStore");

// Get all notes for logged-in user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error("Get notes failed:", err);
    res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
};

// Get single note by ID for logged-in user
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json(note);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    console.error("Get note by id failed:", err);
    res.status(500).json({
      message: "Failed to fetch note details",
    });
  }
};

// Delete a note for logged-in user
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await deleteChunksByNoteId({ noteId: note._id, userId: req.user.id });
    await note.deleteOne();

    res.json({
      message: "Note deleted successfully",
    });

  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid note id" });
    }
    console.error("Delete note failed:", err);

    res.status(500).json({
      message: "Delete failed",
    });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  deleteNote,
};