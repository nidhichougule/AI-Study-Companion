const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

// get all chats of user
router.get("/", auth, async (req, res) => {
  const chats = await Chat.find({ userId: req.user.id });
  res.json(chats);
});

module.exports = router;