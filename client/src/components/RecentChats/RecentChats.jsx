import styles from "./RecentChats.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
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
  if (diffMs < day) return `${Math.floor(diffMs / hour)}d ago`;
  return `${Math.floor(diffMs / day)}d ago`;
};

export default function RecentChats({ chats = [], onOpenChat }) {
  const conversations = chats.slice(0, 6).map((chat) => {
    const lastMessage = (chat.messages || []).slice(-1)[0];

    return {
      id: chat._id,
      title: chat.title || "New Chat",
      preview: lastMessage?.text || "No messages yet",
      time: formatRelativeTime(chat.updatedAt || chat.createdAt),
      tags: [`${(chat.pdfIds || []).length} PDFs`],
      color: "#6366f1",
    };
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent AI Conversations ({chats.length})</h3>
        {chats.length > 0 && (
          <button className={styles.viewAll} onClick={() => onOpenChat?.(conversations[0]?.id)}>
            View all <ArrowIcon />
          </button>
        )}
      </div>
      <div className={styles.grid}>
        {conversations.length === 0 ? (
          <div className={styles.emptyStateCard}>
            💬 No previous chat sessions. Click <strong>"New Chat"</strong> in the sidebar or select a suggested prompt to get started!
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={styles.card}
              style={{ "--accent": conversation.color }}
              onClick={() => onOpenChat?.(conversation.id)}
            >
              <div className={styles.cardTop}>
                <div className={styles.dot} style={{ background: conversation.color }}></div>
                <span className={styles.time}>{conversation.time}</span>
              </div>
              <p className={styles.convTitle}>{conversation.title}</p>
              <p className={styles.preview}>{conversation.preview}</p>
              <div className={styles.footer}>
                <div className={styles.tags}>
                  {conversation.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className={styles.openBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChat?.(conversation.id);
                  }}
                >
                  Open Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

