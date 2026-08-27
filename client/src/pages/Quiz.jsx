import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Quiz.module.css";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import { generateQuiz, getNotes, submitQuizAttempt } from "../services/api";

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export default function Quiz() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [attemptResult, setAttemptResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getNotes()
      .then((res) => setNotes(res.data || []))
      .catch((err) => console.error("Failed to fetch notes:", err));
  }, []);

  const handleToggleNote = (id) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setErrorMsg("");
    setQuiz(null);
    setAttemptResult(null);
    setUserAnswers({});
    setCurrentIdx(0);

    try {
      const res = await generateQuiz({
        noteIds: selectedNoteIds,
        numQuestions,
        difficulty,
      });
      setQuiz(res.data?.quiz || null);
    } catch (err) {
      console.error("Quiz generation failed:", err);
      const msg = err.response?.data?.message || "Quiz generation failed. Please check backend LLM availability.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionKey) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionKey,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quiz._id, userAnswers);
      setAttemptResult(res.data?.attempt || null);
    } catch (err) {
      console.error("Quiz submission failed:", err);
      alert("Failed to submit quiz attempt.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = quiz?.questions?.[currentIdx];
  const totalQuestions = quiz?.questions?.length || 0;

  return (
    <div className={styles.container}>
      <Sidebar
        onLogout={() => { localStorage.removeItem("token"); navigate("/"); }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className={styles.mainContent}>
        <TopBar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className={styles.inner}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>🧠 AI MCQ Practice Quiz</h1>
            <p className={styles.subtitle}>
              Generate grounded multiple choice question tests from your uploaded PDF study materials.
            </p>
          </div>

          {/* SETUP MODE */}
          {!quiz && !attemptResult ? (
            <div className={styles.card}>
              <h3 className={styles.cardSectionTitle}>1. Select Study Material</h3>
              {notes.length === 0 ? (
                <div className={styles.emptyPillsWarning}>
                  ⚠️ No study material uploaded yet. Please upload a PDF in Documents first to generate practice quizzes.
                </div>
              ) : (
                <div className={styles.notePills}>
                  {notes.map((note) => {
                    const isSelected = selectedNoteIds.includes(note._id);
                    return (
                      <button
                        key={note._id}
                        onClick={() => handleToggleNote(note._id)}
                        className={`${styles.notePill} ${isSelected ? styles.notePillSelected : ""}`}
                      >
                        <BookIcon />
                        {isSelected ? "✓ " : ""}{note.fileName}
                      </button>
                    );
                  })}
                </div>
              )}

              <h3 className={styles.cardSectionTitle}>2. Configure Quiz Parameters</h3>
              <div className={styles.configRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Number of Questions</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className={styles.select}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={styles.select}
                  >
                    <option value="mixed">Mixed Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {errorMsg ? (
                <div className={styles.errorCallout}>{errorMsg}</div>
              ) : null}

              <button
                onClick={handleGenerateQuiz}
                disabled={loading || notes.length === 0}
                className={styles.generateBtn}
              >
                <SparklesIcon />
                {loading ? "Generating AI MCQ Quiz..." : "Generate AI Practice Quiz"}
              </button>
            </div>
          ) : null}

          {/* ACTIVE QUIZ MODE */}
          {quiz && !attemptResult && currentQuestion ? (
            <div className={styles.card}>
              <div className={styles.quizTopBar}>
                <span className={styles.qCounter}>
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <span className={styles.diffBadge}>
                  Difficulty: {currentQuestion.difficulty || "medium"}
                </span>
              </div>

              {/* Progress track */}
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }} />
              </div>

              <h2 className={styles.questionText}>
                {currentQuestion.question}
              </h2>

              <div className={styles.optionsGrid}>
                {["A", "B", "C", "D"].map((key) => {
                  const isSelected = userAnswers[currentIdx] === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ""}`}
                    >
                      <span className={`${styles.optKey} ${isSelected ? styles.optKeySelected : ""}`}>
                        {key}
                      </span>
                      <span>{currentQuestion.options[key]}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.quizNav}>
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className={styles.secondaryBtn}
                >
                  &larr; Previous
                </button>

                {currentIdx < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className={styles.nextBtn}
                  >
                    Next Question &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className={styles.submitBtn}
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* RESULTS VIEW */}
          {attemptResult && quiz ? (
            <div className={styles.card}>
              <div className={styles.resultsHeader}>
                <div className={`${styles.scoreRing} ${attemptResult.percentage >= 70 ? styles.scoreHighRing : styles.scoreLowRing}`}>
                  <span className={styles.scorePercent}>{attemptResult.percentage}%</span>
                  <span className={styles.scoreFraction}>{attemptResult.score}/{attemptResult.totalQuestions}</span>
                </div>
                <h2 className={styles.resultsTitle}>Quiz Attempt Summary</h2>
                <p className={styles.resultsFeedback}>
                  {attemptResult.percentage >= 70
                    ? "🎉 Excellent mastery of your study material! Keep up the great work."
                    : "Keep reviewing your study notes and retry to improve your score."}
                </p>
              </div>

              <h3 className={styles.cardSectionTitle}>Detailed Answers & Explanations</h3>
              <div className={styles.answersList}>
                {quiz.questions.map((q, idx) => {
                  const userAns = attemptResult.answers.find((a) => a.questionIndex === idx);
                  const isCorrect = userAns?.isCorrect;
                  const selectedOpt = userAns?.selectedOption || "None";

                  return (
                    <div
                      key={idx}
                      className={`${styles.ansCard} ${isCorrect ? styles.ansCardCorrect : styles.ansCardIncorrect}`}
                    >
                      <div className={styles.ansQuestion}>
                        Q{idx + 1}: {q.question}
                      </div>
                      <div className={`${styles.userAnsLine} ${isCorrect ? styles.correctText : styles.incorrectText}`}>
                        Your Answer: Option {selectedOpt} - {q.options[selectedOpt] || "No response"} {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                      {!isCorrect ? (
                        <div className={`${styles.userAnsLine} ${styles.correctText}`}>
                          Correct Answer: Option {q.correctAnswer} - {q.options[q.correctAnswer]}
                        </div>
                      ) : null}
                      {q.explanation ? (
                        <div className={styles.explanationBox}>
                          💡 <strong>Explanation:</strong> {q.explanation}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => { setQuiz(null); setAttemptResult(null); }}
                className={styles.secondaryBtn}
              >
                🔄 Take Another Quiz
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}