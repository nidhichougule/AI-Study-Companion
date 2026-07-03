import styles from "./DashboardHome.module.css";
import UploadCard from "../UploadCard/UploadCard";
import RecentChats from "../RecentChats/RecentChats";
import RecentPDFs from "../RecentPDFs/RecentPDFs";

const prompts = [
  { id: 1, icon: "💡", text: "Explain a concept from my PDF" },
  { id: 2, icon: "🧪", text: "Quiz me on my last topic" },
  { id: 3, icon: "📝", text: "Summarize my uploaded notes" },
  { id: 4, icon: "🗂️", text: "Create a study plan for me" },
  { id: 5, icon: "🔍", text: "Find key terms in my document" },
  { id: 6, icon: "📊", text: "Compare two concepts" },
];

const stats = [
  { label: "Chats Started", value: "12" },
  { label: "PDFs Uploaded", value: "4" },
  { label: "Topics Covered", value: "27" },
  { label: "Study Streak", value: "5 days" },
];

export default function DashboardHome() {
  return (
    <main className={styles.main}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeHeading}>Good morning, Student 👋</h1>
        <p className={styles.welcomeSub}>
          Upload a PDF or pick up where you left off. Your AI tutor is ready.
        </p>
      </div>

      <div className={styles.statsRow}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <UploadCard />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Suggested Prompts</h3>
        <div className={styles.promptGrid}>
          {prompts.map(p => (
            <button key={p.id} className={styles.promptChip}>
              <span className={styles.promptEmoji}>{p.icon}</span>
              {p.text}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <RecentChats />
      </section>

      <section className={styles.section}>
        <RecentPDFs />
      </section>
    </main>
  );
}
