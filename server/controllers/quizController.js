const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Note = require("../models/Note");
const { retrieveRelevantChunks } = require("../services/retrievalService");
const { generateAnswer } = require("../services/llmService");
const { validateUserPdfIds } = require("./chatController");

const parseAndValidateQuizJson = (rawText) => {
  let cleanedText = String(rawText || "").trim();
  cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

  const jsonStart = cleanedText.indexOf("[");
  const jsonEnd = cleanedText.lastIndexOf("]");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedText = cleanedText.slice(jsonStart, jsonEnd + 1);
  }

  let rawQuestions = [];
  try {
    rawQuestions = JSON.parse(cleanedText);
  } catch (err) {
    console.error("[Quiz Parse Error] Could not parse LLM JSON:", err.message);
    return [];
  }

  if (!Array.isArray(rawQuestions)) return [];

  const validQuestions = [];
  for (const item of rawQuestions) {
    if (!item || typeof item !== "object") continue;

    const questionText = String(item.question || "").trim();
    const options = item.options || {};
    const optA = String(options.A || options.a || "").trim();
    const optB = String(options.B || options.b || "").trim();
    const optC = String(options.C || options.c || "").trim();
    const optD = String(options.D || options.d || "").trim();

    let corr = String(item.correctAnswer || item.correct_answer || "A").trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(corr)) corr = "A";

    const explanation = String(item.explanation || "Grounded in study material.").trim();
    const difficulty = ["easy", "medium", "hard"].includes(String(item.difficulty).toLowerCase())
      ? String(item.difficulty).toLowerCase()
      : "medium";

    if (questionText && optA && optB && optC && optD) {
      validQuestions.push({
        question: questionText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correctAnswer: corr,
        explanation,
        difficulty,
      });
    }
  }

  return validQuestions;
};

const generateQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestedNoteIds = req.body?.noteIds;
    const requestedNum = Math.min(Math.max(Number(req.body?.numQuestions) || 5, 3), 15);
    const requestedDifficulty = String(req.body?.difficulty || "mixed").toLowerCase();

    // 1. Validate requested noteIds belong to req.user.id
    let validatedNoteIds = await validateUserPdfIds(requestedNoteIds, userId);

    // If no noteIds specified, fallback to all notes belonging to req.user.id
    if (!validatedNoteIds.length) {
      const userNotes = await Note.find({ userId }).select("_id");
      validatedNoteIds = userNotes.map((n) => String(n._id));
    }

    if (!validatedNoteIds.length) {
      return res.status(400).json({
        message: "Insufficient study material. Please upload study notes first.",
      });
    }

    // 2. Retrieve document text chunks scoped strictly to user's notes
    const { retrievedChunks } = await retrieveRelevantChunks({
      question: "key definitions concepts theorems formulas core topics",
      userId,
      topK: 8,
      noteIds: validatedNoteIds,
    });

    if (!retrievedChunks.length) {
      return res.status(400).json({
        message: "Insufficient study material text found for quiz generation. Please upload valid study notes.",
      });
    }

    const combinedContext = retrievedChunks
      .map((c) => `[Source: ${c.metadata.fileName || "Note"} (Page ${c.metadata.page || 1})]\n${c.document}`)
      .join("\n\n---\n\n");

    // 3. Prompt Groq LLM for JSON formatted MCQs
    const prompt = `
Task: Generate an accurate ${requestedNum}-question Multiple Choice Quiz (MCQ) based STRICTLY on the study context below.

DIFFICULTY LEVEL: ${requestedDifficulty.toUpperCase()}

CRITICAL RULES:
1. Base EVERY question ONLY on facts present in the study context. Do NOT invent outside knowledge.
2. Return output as a valid JSON array of objects ONLY. No markdown formatting outside JSON.
3. Each question object MUST match this exact JSON structure:
[
  {
    "question": "Clear question text?",
    "options": {
      "A": "First choice",
      "B": "Second choice",
      "C": "Third choice",
      "D": "Fourth choice"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation referencing the context.",
    "difficulty": "medium"
  }
]

STUDY CONTEXT:
${combinedContext}
`;

    const llmRawOutput = await generateAnswer(prompt, { temperature: 0.2 });
    const questions = parseAndValidateQuizJson(llmRawOutput);

    if (!questions.length) {
      return res.status(500).json({
        message: "Failed to generate valid quiz questions from the provided study material. Please try again.",
      });
    }

    // 4. Create and save Quiz
    const quizTitle = `Quiz: ${retrievedChunks[0]?.metadata?.fileName || "Study Notes"} (${questions.length} Qs)`;
    const quiz = await Quiz.create({
      userId,
      title: quizTitle,
      noteIds: validatedNoteIds,
      difficulty: requestedDifficulty,
      questions,
    });

    res.status(201).json({ quiz });
  } catch (error) {
    console.error("Generate quiz failed:", error);
    res.status(500).json({ message: "Quiz generation failed." });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error("Get quizzes failed:", err);
    res.status(500).json({ message: "Failed to fetch quizzes." });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid quiz id" });
    }
    console.error("Get quiz by id failed:", err);
    res.status(500).json({ message: "Failed to fetch quiz." });
  }
};

const submitQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const userAnswers = req.body?.answers || {}; // Object mapping question index -> selectedOption e.g. { 0: "A", 1: "C" }
    let score = 0;
    const evaluatedAnswers = [];

    quiz.questions.forEach((q, idx) => {
      let selectedOption = "";
      if (Array.isArray(userAnswers)) {
        const item = userAnswers.find((a) => a.questionIndex === idx);
        selectedOption = String(item?.selectedOption || "").toUpperCase();
      } else {
        selectedOption = String(userAnswers[idx] || userAnswers[String(idx)] || "").toUpperCase();
      }

      const isCorrect = selectedOption === q.correctAnswer;
      if (isCorrect) score += 1;

      evaluatedAnswers.push({
        questionIndex: idx,
        selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect,
      });
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId: quiz._id,
      answers: evaluatedAnswers,
      score,
      totalQuestions,
      percentage,
    });

    res.status(201).json({
      attempt,
      quiz,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid quiz id" });
    }
    console.error("Submit quiz attempt failed:", err);
    res.status(500).json({ message: "Failed to submit quiz attempt." });
  }
};

const getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quizId: req.params.id,
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(attempts);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid quiz id" });
    }
    console.error("Get quiz attempts failed:", err);
    res.status(500).json({ message: "Failed to fetch quiz attempts." });
  }
};

module.exports = {
  generateQuiz,
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  getQuizAttempts,
};