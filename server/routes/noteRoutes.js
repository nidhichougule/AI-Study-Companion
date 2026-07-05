const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getNotes,
  deleteNote,
} = require("../controllers/noteController");

router.get("/", auth, getNotes);

router.delete("/:id", auth, deleteNote);

module.exports = router;