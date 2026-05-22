const express = require("express");
const { generateQuiz } = require("../controllers/quizController");

const router = express.Router();

router.get("/generate", generateQuiz);

module.exports = router;