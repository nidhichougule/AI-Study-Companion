import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardHome.module.css";
import UploadCard from "../UploadCard/UploadCard";
import RecentChats from "../RecentChats/RecentChats";
import RecentPDFs from "../RecentPDFs/RecentPDFs";
import { DATA_CHANGED_EVENT, getChats, getNotes } from "../../services/api";

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
  const [notes, setNotes] = useState([]);
  const [chats, setChats] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [notesResponse, chatsResponse] = await Promise.all([getNotes(), getChats()]);
      setNotes(notesResponse.data || []);
      setChats(chatsResponse.data || []);
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
    { label: "Chats Started", value: String(chats.length) },
    { label: "PDFs Uploaded", value: String(notes.length) },
    { label: "Total Chunks", value: String(totalChunks) },
    { label: "Total Pages", value: String(totalPages) },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeHeading}>Good morning, Student 👋</h1>
        <p className={styles.welcomeSub}>
          Upload a PDF or pick up where you left off. Your AI tutor is ready.
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

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Suggested Prompts</h3>
        <div className={styles.promptGrid}>
          {prompts.map((prompt) => (
            <button key={prompt.id} className={styles.promptChip}>
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
