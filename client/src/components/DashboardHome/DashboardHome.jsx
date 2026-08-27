import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardHome.module.css";
import UploadCard from "../UploadCard/UploadCard";
import RecentChats from "../RecentChats/RecentChats";
import RecentPDFs from "../RecentPDFs/RecentPDFs";
import { DATA_CHANGED_EVENT, getChats, getNotes, getUserProgress } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
    <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const AwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const prompts = [
  { id: 1, icon: "💡", text: "Explain a key concept from my uploaded PDF" },
  { id: 2, icon: "🧪", text: "Generate a quiz from my study material" },
  { id: 3, icon: "📝", text: "Summarize main points in bullet points" },
  { id: 4, icon: "🗂️", text: "Create a structured exam revision plan" },
  { id: 5, icon: "🔍", text: "Define key terms and definitions" },
  { id: 6, icon: "📊", text: "Compare and contrast main topics" },
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

  const stats = [
    {
      label: "Quizzes Completed",
      value: String(progress?.totalQuizzesCompleted || 0),
      icon: <TrophyIcon />,
      color: "#8b5cf6",
    },
    {
      label: "Average Score",
      value: `${progress?.averageScore || 0}%`,
      icon: <TargetIcon />,
      color: "#6366f1",
    },
    {
      label: "Best Score",
      value: `${progress?.highestScore || 0}%`,
      icon: <AwardIcon />,
      color: "#10b981",
    },
    {
      label: "Questions Answered",
      value: String(progress?.totalQuestionsAnswered || 0),
      icon: <HelpIcon />,
      color: "#3b82f6",
    },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.badge}>
              <SparklesIcon /> AI-Powered Study Companion
            </span>
            <span className={styles.docCountBadge}>{notes.length} Study PDFs Loaded</span>
          </div>
          <h1 className={styles.welcomeHeading}>Welcome back, {user?.name || "Student"}! 👋</h1>
          <p className={styles.welcomeSub}>
            Your intelligent RAG tutor is ready. Ask questions, explore indexed documents, or generate practice quizzes grounded in your course materials.
          </p>
        </div>
      </div>

      {/* STATS OVERVIEW GRID */}
      <div className={styles.statsRow}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard} style={{ "--accent": stat.color }}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* DRAG AND DROP PDF UPLOADER */}
      <section className={styles.section}>
        <UploadCard />
      </section>

      {/* QUIZ ATTEMPTS PROGRESS HISTORY */}
      {progress?.recentAttempts?.length ? (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Quiz Performance</h3>
            <button className={styles.sectionLink} onClick={() => navigate("/quiz")}>
              Practice Quiz &rarr;
            </button>
          </div>
          <div className={styles.attemptsCard}>
            {progress.recentAttempts.map((attempt) => {
              const isHigh = attempt.percentage >= 70;
              return (
                <div key={attempt.id} className={styles.attemptRow}>
                  <div className={styles.attemptLeft}>
                    <span className={styles.attemptTitle}>{attempt.quizTitle || "MCQ Quiz Attempt"}</span>
                    <span className={styles.attemptMeta}>
                      Score: {attempt.score}/{attempt.totalQuestions} questions · {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className={`${styles.scorePill} ${isHigh ? styles.scoreHigh : styles.scoreLow}`}>
                    {attempt.percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* SUGGESTED PROMPTS */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Suggested AI Prompts</h3>
        <div className={styles.promptGrid}>
          {prompts.map((prompt) => (
            <button key={prompt.id} className={styles.promptChip} onClick={() => navigate("/chat")}>
              <span className={styles.promptEmoji}>{prompt.icon}</span>
              <span className={styles.promptText}>{prompt.text}</span>
            </button>
          ))}
        </div>
      </section>

      {/* RECENT CHATS */}
      <section className={styles.section}>
        <RecentChats chats={chats} onOpenChat={(chatId) => navigate(`/chat?chatId=${chatId}`)} />
      </section>

      {/* RECENT PDFS */}
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

