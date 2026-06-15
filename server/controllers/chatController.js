const Chat = require("../models/Chat");

// ASK QUESTION (PERSISTENT VERSION)
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    // 🔥 your existing RAG logic
    const answer = await generateAnswerFromRAG(question);

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const words = answer.split(" ");

    for (let word of words) {
      res.write(word + " ");
      await new Promise((r) => setTimeout(r, 60)); // typing speed
    }

    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};const generateAnswerFromRAG = async (question) => {
  // Replace with your real RAG pipeline
  return "This is a streamed AI response generated from your study companion RAG system.";
};
// GET ALL CHATS
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE NEW CHAT
const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      userId: req.user.id,
      title: "New Chat",
      messages: [],
    });

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  askQuestion,
  getChats,
  createChat,
};