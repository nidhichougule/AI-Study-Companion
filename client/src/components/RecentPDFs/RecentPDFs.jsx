import { useState } from "react";
import styles from "./RecentPDFs.module.css";
import { deleteNote, notifyDataChanged } from "../../services/api";

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6m3 0V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function RecentPDFs({ notes = [], chats = [], onSelectPdf, showDelete = true }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, noteId, fileName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This will permanently remove its vector embeddings.`)) {
      return;
    }
    setDeletingId(noteId);
    try {
      await deleteNote(noteId);
      notifyDataChanged();
    } catch (err) {
      console.error("Delete note failed:", err);
      alert("Failed to delete PDF note.");
    } finally {
      setDeletingId(null);
    }
  };

  const rows = notes.map((note) => {
    const chatCount = chats.filter((chat) => (chat.pdfIds || []).includes(note._id)).length;
    return {
      id: note._id,
      name: note.fileName || "Untitled PDF",
      status: note.status || "processed",
      uploaded: formatDate(note.createdAt),
      pages: Number(note.pageCount) || 0,
      chunks: Number(note.chunkCount) || 0,
      chats: chatCount,
    };
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Uploaded Study Documents ({notes.length})</h3>
      </div>
      <div className={styles.list}>
        {rows.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <p className={styles.emptyTitle}>No documents uploaded yet</p>
            <p className={styles.emptySub}>Drop a PDF note or textbook above to start asking questions!</p>
          </div>
        ) : (
          rows.map((pdf) => (
            <div key={pdf.id} className={styles.row}>
              <div className={styles.iconWrap}>
                <FileIcon />
              </div>
              <div className={styles.info}>
                <p className={styles.pdfName}>{pdf.name}</p>
                <div className={styles.meta}>
                  <span className={styles.statusBadge}>
                    <span className={styles.statusDot} />
                    {pdf.status}
                  </span>
                  <span className={styles.dot}>·</span>
                  <span>{pdf.uploaded}</span>
                  <span className={styles.dot}>·</span>
                  <span>{pdf.pages} pages</span>
                  <span className={styles.dot}>·</span>
                  <span>{pdf.chunks} chunks</span>
                </div>
              </div>
              <div className={styles.right}>
                <span className={styles.chatBadge} title="Associated chats">
                  <ChatBubbleIcon />
                  {pdf.chats} chats
                </span>
                {onSelectPdf ? (
                  <button className={styles.askBtn} onClick={() => onSelectPdf(pdf.id)}>
                    ✨ Ask AI
                  </button>
                ) : null}
                {showDelete ? (
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, pdf.id, pdf.name)}
                    disabled={deletingId === pdf.id}
                    title="Delete PDF and vector embeddings"
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

