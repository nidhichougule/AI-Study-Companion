const Note = require("../models/Note");

// Get all notes for logged-in user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
};

// Delete a note
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

    await note.deleteOne();

    res.json({
      message: "Note deleted successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Delete failed",
    });
  }
};

module.exports = {
  getNotes,
  deleteNote,
};  