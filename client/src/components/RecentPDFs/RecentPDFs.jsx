import styles from "./RecentPDFs.module.css";

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function RecentPDFs({ notes = [], chats = [], onSelectPdf }) {
  const rows = notes.map((note) => {
    const chatCount = chats.filter((chat) => (chat.pdfIds || []).includes(note._id)).length;
    return {
      id: note._id,
      name: note.fileName || "Untitled PDF",
      uploaded: formatDate(note.createdAt),
      pages: Number(note.pageCount) || 0,
      chunks: Number(note.chunkCount) || 0,
      chats: chatCount,
    };
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent PDFs</h3>
      </div>
      <div className={styles.list}>
        {rows.map((pdf) => (
          <div key={pdf.id} className={styles.row}>
            <div className={styles.iconWrap}>
              <FileIcon />
            </div>
            <div className={styles.info}>
              <p className={styles.pdfName}>{pdf.name}</p>
              <div className={styles.meta}>
                <span>{pdf.uploaded}</span>
                <span className={styles.dot}>·</span>
                <span>{pdf.pages} pages</span>
                <span className={styles.dot}>·</span>
                <span>{pdf.chunks} chunks</span>
              </div>
            </div>
            <div className={styles.right}>
              <span className={styles.chatBadge}>
                <ChatBubbleIcon />
                {pdf.chats}
              </span>
              <button className={styles.askBtn} onClick={() => onSelectPdf?.(pdf.id)}>
                Ask AI
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
