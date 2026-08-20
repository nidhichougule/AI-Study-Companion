const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  generateQuiz,
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  getQuizAttempts,
} = require("../controllers/quizController");

router.post("/generate", auth, generateQuiz);
router.get("/generate", auth, generateQuiz); // Backward compatibility
router.get("/", auth, getQuizzes);
router.get("/:id", auth, getQuizById);
router.post("/:id/attempt", auth, submitQuizAttempt);
router.get("/:id/attempts", auth, getQuizAttempts);

module.exports = router;