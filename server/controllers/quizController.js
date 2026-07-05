const Note = require("../models/Note");
const { getAllChunksForNote } = require("../services/retrievalService");

const generateQuiz = async (req, res) => {
  try {
    const latestNote = await Note.findOne().sort({ createdAt: -1 });

    if (!latestNote) {
      return res.status(404).json({
        message: "Upload a PDF first.",
      });
    }

    const retrievedChunks = await getAllChunksForNote({
      noteId: latestNote._id,
      userId: latestNote.userId,
    });

    const text = retrievedChunks.map((chunk) => chunk.document).join("\n\n");

    if (!text.trim()) {
      return res.json({
        quiz: [],
        message: "No stored chunks found for the latest PDF.",
      });
    }

    const questionMatches = text.match(/\d+\.\s.*?\?/g);

    if (!questionMatches || questionMatches.length === 0) {
      return res.json({
        quiz: [],
        message: "No questions found in PDF.",
      });
    }

    const quiz = questionMatches.slice(0, 10).map((q, index) => ({
      id: index + 1,
      question: q.trim(),
    }));

    res.json({
      message: "Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Quiz generation failed:", error);
    res.status(500).json({
      message: "Quiz generation failed",
      error: error.message,
    });
  }
};

module.exports = { generateQuiz };