const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const chatRoutes = require("./routes/chatRoutes");
const quizRoutes = require("./routes/quizRoutes");
const Note = require("./models/Note");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", quizRoutes);

app.get("/", (req, res) => {
  res.send("AI Study Companion Backend Running");
});

app.get("/api/debug/latest-note", async (req, res) => {
  const note = await Note.findOne().sort({ createdAt: -1 });

  if (!note) {
    return res.json({ message: "No note found" });
  }

  res.json({
    fileName: note.fileName,
    textPreview: note.extractedText.substring(0, 3000),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});