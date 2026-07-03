import styles from "./RecentChats.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const conversations = [
  { id: 1, title: "Explain neural networks", preview: "A neural network is a computational model inspired by the structure of the brain...", time: "2h ago", tags: ["AI", "Machine Learning"], color: "#6366f1" },
  { id: 2, title: "Thermodynamics Chapter 5", preview: "The first law of thermodynamics states that energy cannot be created or destroyed...", time: "Yesterday", tags: ["Physics"], color: "#0ea5e9" },
  { id: 3, title: "World War II Quiz", preview: "Q: When did WW2 begin? A: World War II began on September 1, 1939...", time: "2 days ago", tags: ["History", "Quiz"], color: "#f59e0b" },
];

export default function RecentChats() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Conversations</h3>
        <button className={styles.viewAll}>View all <ArrowIcon /></button>
      </div>
      <div className={styles.grid}>
        {conversations.map(conv => (
          <div key={conv.id} className={styles.card} style={{ "--accent": conv.color }}>
            <div className={styles.cardTop}>
              <div className={styles.dot} style={{ background: conv.color }}></div>
              <span className={styles.time}>{conv.time}</span>
            </div>
            <p className={styles.convTitle}>{conv.title}</p>
            <p className={styles.preview}>{conv.preview}</p>
            <div className={styles.footer}>
              <div className={styles.tags}>
                {conv.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
              <button className={styles.openBtn}>Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
