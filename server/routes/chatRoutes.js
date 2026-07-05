const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  askQuestion,
  listChats,
  createChat,
  getChatById,
  updateChat,
  deleteChat,
  continueConversation,
} = require("../controllers/chatController");

router.post("/ask", auth, askQuestion);
router.get("/", auth, listChats);
router.post("/create", auth, createChat);
router.get("/:chatId", auth, getChatById);
router.patch("/:chatId/rename", auth, updateChat);
router.delete("/:chatId", auth, deleteChat);
router.post("/:chatId/messages", auth, continueConversation);

module.exports = router;