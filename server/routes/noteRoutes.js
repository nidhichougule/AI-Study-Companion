const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getNotes,
  getNoteById,
  deleteNote,
} = require("../controllers/noteController");

router.get("/", auth, getNotes);
router.get("/:id", auth, getNoteById);
router.delete("/:id", auth, deleteNote);

module.exports = router;