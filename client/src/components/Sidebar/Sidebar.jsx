import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { DATA_CHANGED_EVENT, getChats, getNotes } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M21 12h-2M5 12H3M12 21v-2M12 5V3" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6m3 0V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();
  if (!timestamp) return "Just now";

  const diffMs = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
};

export default function Sidebar({
  onLogout,
  onSelectChat,
  onSelectPdf,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  showChatActions = false,
  activeChatId = null,
  selectedPdfIds = [],
}) {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [notes, setNotes] = useState([]);

  const loadSidebarData = useCallback(async () => {
    try {
      const [chatsResponse, notesResponse] = await Promise.all([getChats(), getNotes()]);
      setChats(chatsResponse.data || []);
      setNotes(notesResponse.data || []);
    } catch (error) {
      console.error("Sidebar data load failed:", error);
    }
  }, []);

  useEffect(() => {
    loadSidebarData();
  }, [loadSidebarData]);

  useEffect(() => {
    const listener = () => {
      loadSidebarData();
    };
    window.addEventListener(DATA_CHANGED_EVENT, listener);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, listener);
  }, [loadSidebarData]);

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) =>
        String(chat.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [chats, searchQuery]
  );

  const handleOpenChat = (chat) => {
    if (onSelectChat) {
      onSelectChat(chat);
      return;
    }
    navigate(`/chat?chatId=${chat._id}`);
  };

  const handleSelectPdf = (note) => {
    if (onSelectPdf) {
      onSelectPdf(note);
      return;
    }
    navigate(`/chat?pdfId=${note._id}`);
  };

  const handleRename = (event, chat) => {
    event.stopPropagation();
    onRenameChat?.(chat);
  };

  const handleDelete = (event, chat) => {
    event.stopPropagation();
    onDeleteChat?.(chat);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <BookIcon />
        </div>
        <span className={styles.logoText}>StudyAI</span>
      </div>

      <button
        className={styles.newChatBtn}
        onClick={() => {
          if (onNewChat) {
            onNewChat();
            return;
          }
          navigate("/chat");
        }}
      >
        <PlusIcon />
        New Chat
      </button>

      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Recent Chats</p>
        <ul className={styles.chatList}>
          {filteredChats.map((chat) => (
            <li
              key={chat._id}
              className={`${styles.chatItem} ${activeChatId === chat._id ? styles.chatItemActive : ""}`}
              onClick={() => handleOpenChat(chat)}
            >
              <span className={styles.itemIcon}>
                <ChatIcon />
              </span>
              <div className={styles.chatMeta}>
                <span className={styles.chatTitle}>{chat.title || "New Chat"}</span>
                <span className={styles.chatTime}>{formatRelativeTime(chat.updatedAt || chat.createdAt)}</span>
              </div>
              {showChatActions ? (
                <div className={styles.chatActions}>
                  <button className={styles.chatActionBtn} onClick={(event) => handleRename(event, chat)} title="Rename chat">
                    <EditIcon />
                  </button>
                  <button className={styles.chatActionBtn} onClick={(event) => handleDelete(event, chat)} title="Delete chat">
                    <TrashIcon />
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Recent PDFs</p>
        <ul className={styles.chatList}>
          {notes.slice(0, 8).map((pdf) => (
            <li
              key={pdf._id}
              className={`${styles.chatItem} ${selectedPdfIds.includes(pdf._id) ? styles.chatItemSelected : ""}`}
              onClick={() => handleSelectPdf(pdf)}
            >
              <span className={styles.itemIcon}>
                <FileIcon />
              </span>
              <div className={styles.chatMeta}>
                <span className={styles.chatTitle}>{pdf.fileName}</span>
                <span className={styles.chatTime}>
                  {Number(pdf.pageCount) || 0} pages · {Number(pdf.chunkCount) || 0} chunks
                </span>
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
          <div className={styles.avatar}>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user?.name || "User"}</span>
            <span className={styles.profileEmail}>{user?.email || "user@study.ai"}</span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout || authLogout} title="Logout">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
