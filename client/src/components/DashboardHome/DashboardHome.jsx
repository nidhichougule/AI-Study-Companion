import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardHome.module.css";
import UploadCard from "../UploadCard/UploadCard";
import RecentChats from "../RecentChats/RecentChats";
import RecentPDFs from "../RecentPDFs/RecentPDFs";
import { DATA_CHANGED_EVENT, getChats, getNotes, getUserProgress } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const prompts = [
  { id: 1, icon: "💡", text: "Explain a concept from my PDF" },
  { id: 2, icon: "🧪", text: "Quiz me on my last topic" },
  { id: 3, icon: "📝", text: "Summarize my uploaded notes" },
  { id: 4, icon: "🗂️", text: "Create a study plan for me" },
  { id: 5, icon: "🔍", text: "Find key terms in my document" },
  { id: 6, icon: "📊", text: "Compare two concepts" },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [chats, setChats] = useState([]);
  const [progress, setProgress] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [notesResponse, chatsResponse, progressResponse] = await Promise.all([
        getNotes(),
        getChats(),
        getUserProgress(),
      ]);
      setNotes(notesResponse.data || []);
      setChats(chatsResponse.data || []);
      setProgress(progressResponse.data || null);
    } catch (error) {
      console.error("Dashboard data load failed:", error);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const listener = () => {
      loadDashboardData();
    };

    window.addEventListener(DATA_CHANGED_EVENT, listener);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, listener);
  }, [loadDashboardData]);

  const totalChunks = useMemo(
    () => notes.reduce((sum, note) => sum + (Number(note.chunkCount) || 0), 0),
    [notes]
  );
  const totalPages = useMemo(
    () => notes.reduce((sum, note) => sum + (Number(note.pageCount) || 0), 0),
    [notes]
  );

  const stats = [
    { label: "Quizzes Completed", value: String(progress?.totalQuizzesCompleted || 0) },
    { label: "Average Score", value: `${progress?.averageScore || 0}%` },
    { label: "Best Score", value: `${progress?.highestScore || 0}%` },
    { label: "Questions Answered", value: String(progress?.totalQuestionsAnswered || 0) },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeHeading}>Welcome back, {user?.name || "Student"} 👋</h1>
        <p className={styles.welcomeSub}>
          Track your study progress, generate AI quizzes, or ask your study companion anything.
        </p>
      </div>

      <div className={styles.statsRow}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <UploadCard />
      </section>

      {/* QUIZ ATTEMPTS PROGRESS HISTORY */}
      {progress?.recentAttempts?.length ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Quiz Progress</h3>
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden", padding: "16px" }}>
            {progress.recentAttempts.map((attempt) => (
              <div key={attempt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0" }}>{attempt.quizTitle}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Score: {attempt.score}/{attempt.totalQuestions} · {new Date(attempt.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: attempt.percentage >= 70 ? "#4ade80" : "#f87171" }}>
                  {attempt.percentage}%
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Suggested Prompts</h3>
        <div className={styles.promptGrid}>
          {prompts.map((prompt) => (
            <button key={prompt.id} className={styles.promptChip} onClick={() => navigate("/chat")}>
              <span className={styles.promptEmoji}>{prompt.icon}</span>
              {prompt.text}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <RecentChats chats={chats} onOpenChat={(chatId) => navigate(`/chat?chatId=${chatId}`)} />
      </section>

      <section className={styles.section}>
        <RecentPDFs
          notes={notes}
          chats={chats}
          onSelectPdf={(pdfId) => navigate(`/chat?pdfId=${pdfId}`)}
        />
      </section>
    </main>
  );
}
