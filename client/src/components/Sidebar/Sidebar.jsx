import { useState } from "react";
import styles from "./Sidebar.module.css";

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M21 12h-2M5 12H3M12 21v-2M12 5V3"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const recentChats = [
  { id: 1, title: "Explain neural networks", time: "2h ago" },
  { id: 2, title: "Summarize Chapter 5 - Thermodynamics", time: "Yesterday" },
  { id: 3, title: "Quiz me on World War II", time: "2 days ago" },
  { id: 4, title: "Help with calculus integration", time: "3 days ago" },
];
const recentPDFs = [
  { id: 1, name: "Physics_Textbook_Ch7.pdf", pages: 24 },
  { id: 2, name: "History_Notes_2024.pdf", pages: 12 },
  { id: 3, name: "Math_Formulas.pdf", pages: 6 },
];

export default function Sidebar({ onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  const filteredChats = recentChats.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}><BookIcon /></div>
        <span className={styles.logoText}>StudyAI</span>
      </div>

      <button className={styles.newChatBtn}>
        <PlusIcon />
        New Chat
      </button>

      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          placeholder="Search chats..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Recent Chats</p>
        <ul className={styles.chatList}>
          {filteredChats.map(chat => (
            <li
              key={chat.id}
              className={`${styles.chatItem} ${activeChat === chat.id ? styles.chatItemActive : ""}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <span className={styles.itemIcon}><ChatIcon /></span>
              <div className={styles.chatMeta}>
                <span className={styles.chatTitle}>{chat.title}</span>
                <span className={styles.chatTime}>{chat.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Recent PDFs</p>
        <ul className={styles.chatList}>
          {recentPDFs.map(pdf => (
            <li key={pdf.id} className={styles.chatItem}>
              <span className={styles.itemIcon}><FileIcon /></span>
              <div className={styles.chatMeta}>
                <span className={styles.chatTitle}>{pdf.name}</span>
                <span className={styles.chatTime}>{pdf.pages} pages</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.bottomSection}>
        <button className={styles.bottomBtn}>
          <SettingsIcon />
          Settings
        </button>
        <div className={styles.profileRow}>
          <div className={styles.avatar}>S</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Student</span>
            <span className={styles.profileEmail}>student@study.ai</span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout} title="Logout">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
