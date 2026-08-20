const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true,
  },
  explanation: {
    type: String,
    default: "",
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  sourceInfo: {
    noteId: { type: String },
    fileName: { type: String },
    page: { type: Number },
  },
});

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "AI MCQ Quiz",
    },
    noteIds: [
      {
        type: String,
      },
    ],
    difficulty: {
      type: String,
      default: "mixed",
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
