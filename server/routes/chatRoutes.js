const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  askQuestion,
  getChats,
  createChat,
} = require("../controllers/chatController");

router.post("/ask", auth, askQuestion);
router.get("/", auth, getChats);
router.post("/create", auth, createChat);

module.exports = router;