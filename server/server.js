const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const Note = require("./models/Note");

const chatRoutes = require("./routes/chatRoutes");
const chatHistoryRoutes = require("./routes/chatHistoryRoutes");
const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const quizRoutes = require("./routes/quizRoutes");
const retrievalRoutes = require("./routes/retrievalRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chats", chatHistoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/retrieval", retrievalRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("AI Study Companion Backend Running");
});

// Debug route
app.get("/api/debug/latest-note", async (req, res) => {
  try {
    const note = await Note.findOne().sort({ createdAt: -1 });

    if (!note) {
      return res.json({ message: "No note found" });
    }

    res.json({
      fileName: note.fileName,
      chunkCount: note.chunkCount,
      pdfTextLength: note.pdfTextLength,
    });
  } catch (error) {
    console.error("Debug latest note error:", error);
    res.status(500).json({
      message: "Failed to fetch latest note",
    });
  }
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});