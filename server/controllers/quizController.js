const Note = require("../models/Note");

const generateQuiz = async (req, res) => {
  try {
    const latestNote = await Note.findOne().sort({ createdAt: -1 });

    if (!latestNote) {
      return res.status(404).json({
        message: "Upload a PDF first.",
      });
    }

    const text = latestNote.extractedText;

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
    res.status(500).json({
      message: "Quiz generation failed",
      error: error.message,
    });
  }
};

module.exports = { generateQuiz };