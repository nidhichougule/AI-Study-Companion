const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");

const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all attempts for authenticated user
    const attempts = await QuizAttempt.find({ userId })
      .populate("quizId", "title difficulty")
      .sort({ createdAt: -1 });

    if (!attempts.length) {
      return res.json({
        totalQuizzesAttempted: 0,
        totalQuizzesCompleted: 0,
        averageScore: 0,
        highestScore: 0,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        recentAttempts: [],
        scoreHistory: [],
      });
    }

    const totalQuizzesCompleted = attempts.length;
    let totalScoreSum = 0;
    let highestScore = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;

    const recentAttempts = [];
    const scoreHistory = [];

    attempts.forEach((attempt) => {
      totalScoreSum += attempt.percentage;
      if (attempt.percentage > highestScore) {
        highestScore = attempt.percentage;
      }

      totalQuestionsAnswered += attempt.totalQuestions;
      totalCorrectAnswers += attempt.score;

      const title = attempt.quizId?.title || "AI MCQ Quiz";
      const dateStr = new Date(attempt.createdAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
      });

      if (recentAttempts.length < 5) {
        recentAttempts.push({
          id: attempt._id,
          quizId: attempt.quizId?._id || attempt.quizId,
          quizTitle: title,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          completedAt: attempt.createdAt,
        });
      }

      scoreHistory.unshift({
        date: dateStr,
        percentage: attempt.percentage,
        title,
      });
    });

    const averageScore = Math.round((totalScoreSum / totalQuizzesCompleted) * 10) / 10;
    const incorrectAnswers = totalQuestionsAnswered - totalCorrectAnswers;

    res.json({
      totalQuizzesAttempted: totalQuizzesCompleted,
      totalQuizzesCompleted,
      averageScore,
      highestScore,
      totalQuestionsAnswered,
      correctAnswers: totalCorrectAnswers,
      incorrectAnswers,
      recentAttempts,
      scoreHistory,
    });
  } catch (err) {
    console.error("Get user progress failed:", err);
    res.status(500).json({ message: "Failed to fetch user progress analytics." });
  }
};

module.exports = { getUserProgress };
