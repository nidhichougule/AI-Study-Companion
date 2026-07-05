const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  listChats,
  createChat,
  getChatById,
  updateChat,
  deleteChat,
  continueConversation,
} = require("../controllers/chatController");

router.get("/", auth, listChats);
router.post("/", auth, createChat);
router.get("/:chatId", auth, getChatById);
router.patch("/:chatId", auth, updateChat);
router.delete("/:chatId", auth, deleteChat);
router.post("/:chatId/messages", auth, continueConversation);

module.exports = router;