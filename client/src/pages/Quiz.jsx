import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import { generateQuiz, getNotes, submitQuizAttempt } from "../services/api";

export default function Quiz() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { 0: "A", 1: "C" }
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
      const msg = err.response?.data?.message || "Quiz generation failed. Please try again.";
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
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white", fontFamily: "sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/"); }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <TopBar />
        <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 6px", color: "#f8fafc" }}>
              🧠 AI MCQ Practice Quiz
            </h1>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
              Generate grounded multiple choice questions from your uploaded study materials.
            </p>
          </div>

          {/* SETUP MODE */}
          {!quiz && !attemptResult ? (
            <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#e2e8f0" }}>1. Select Study Material</h3>
              {notes.length === 0 ? (
                <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>
                  No study material uploaded yet. Please upload a PDF first to generate quizzes.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                  {notes.map((note) => {
                    const isSelected = selectedNoteIds.includes(note._id);
                    return (
                      <button
                        key={note._id}
                        onClick={() => handleToggleNote(note._id)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          background: isSelected ? "#3b82f6" : "rgba(255,255,255,0.05)",
                          color: isSelected ? "#ffffff" : "#cbd5e1",
                          border: isSelected ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {isSelected ? "✓ " : ""}{note.fileName}
                      </button>
                    );
                  })}
                </div>
              )}

              <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#e2e8f0" }}>2. Configure Quiz Settings</h3>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    Number of Questions
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    style={{ background: "#0f172a", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px" }}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ background: "#0f172a", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px" }}
                  >
                    <option value="mixed">Mixed</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {errorMsg ? (
                <div style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>{errorMsg}</div>
              ) : null}

              <button
                onClick={handleGenerateQuiz}
                disabled={loading || notes.length === 0}
                style={{
                  padding: "12px 24px",
                  background: loading ? "#64748b" : "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading || notes.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Generating AI MCQ Quiz..." : "✨ Generate AI Quiz"}
              </button>
            </div>
          ) : null}

          {/* ACTIVE QUIZ MODE */}
          {quiz && !attemptResult && currentQuestion ? (
            <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <span style={{ fontSize: "12px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "3px 8px", borderRadius: "4px" }}>
                  Difficulty: {currentQuestion.difficulty || "medium"}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ background: "#0f172a", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "20px" }}>
                <div style={{ background: "#3b82f6", height: "100%", width: `${((currentIdx + 1) / totalQuestions) * 100}%` }} />
              </div>

              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", marginBottom: "20px", lineHeight: "1.5" }}>
                {currentQuestion.question}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {["A", "B", "C", "D"].map((key) => {
                  const isSelected = userAnswers[currentIdx] === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        textAlign: "left",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.08)",
                        color: isSelected ? "#93c5fd" : "#cbd5e1",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <strong style={{ marginRight: "12px", color: isSelected ? "#60a5fa" : "#64748b" }}>{key}.</strong>
                      {currentQuestion.options[key]}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    borderRadius: "6px",
                    cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                    opacity: currentIdx === 0 ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>

                {currentIdx < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    style={{ padding: "8px 16px", background: "#3b82f6", border: "none", color: "white", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    style={{ padding: "8px 20px", background: "#22c55e", border: "none", color: "white", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* RESULTS VIEW */}
          {attemptResult && quiz ? (
            <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#f8fafc" }}>Quiz Results</h2>
                <div style={{ fontSize: "36px", fontWeight: "800", color: attemptResult.percentage >= 70 ? "#4ade80" : "#f87171" }}>
                  {attemptResult.score} / {attemptResult.totalQuestions} ({attemptResult.percentage}%)
                </div>
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
                  {attemptResult.percentage >= 70 ? "🎉 Excellent mastery of your study material!" : "Keep reviewing your notes to improve."}
                </p>
              </div>

              <h3 style={{ fontSize: "15px", margin: "0 0 16px", color: "#e2e8f0" }}>Detailed Answers & Explanations</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                {quiz.questions.map((q, idx) => {
                  const userAns = attemptResult.answers.find((a) => a.questionIndex === idx);
                  const isCorrect = userAns?.isCorrect;
                  const selectedOpt = userAns?.selectedOption || "None";

                  return (
                    <div key={idx} style={{ padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", borderLeft: isCorrect ? "4px solid #22c55e" : "4px solid #ef4444" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc", marginBottom: "8px" }}>
                        Q{idx + 1}: {q.question}
                      </div>
                      <div style={{ fontSize: "13px", color: isCorrect ? "#4ade80" : "#f87171", marginBottom: "4px" }}>
                        Your Answer: {selectedOpt} - {q.options[selectedOpt] || "No response"} {isCorrect ? "✓" : "✗"}
                      </div>
                      {!isCorrect ? (
                        <div style={{ fontSize: "13px", color: "#4ade80", marginBottom: "6px" }}>
                          Correct Answer: {q.correctAnswer} - {q.options[q.correctAnswer]}
                        </div>
                      ) : null}
                      {q.explanation ? (
                        <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "4px", marginTop: "6px" }}>
                          💡 <strong>Explanation:</strong> {q.explanation}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => { setQuiz(null); setAttemptResult(null); }}
                style={{ padding: "10px 20px", background: "#3b82f6", border: "none", color: "white", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
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