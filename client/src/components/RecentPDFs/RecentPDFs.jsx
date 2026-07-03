import styles from "./RecentPDFs.module.css";

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const pdfs = [
  { id: 1, name: "Physics Textbook Ch. 7", size: "4.2 MB", pages: 24, chats: 3, uploaded: "Today" },
  { id: 2, name: "History Notes 2024", size: "1.8 MB", pages: 12, chats: 1, uploaded: "Yesterday" },
  { id: 3, name: "Math Formula Sheet", size: "0.9 MB", pages: 6, chats: 5, uploaded: "3 days ago" },
  { id: 4, name: "Chemistry Lab Report", size: "2.1 MB", pages: 9, chats: 0, uploaded: "5 days ago" },
];

export default function RecentPDFs() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent PDFs</h3>
      </div>
      <div className={styles.list}>
        {pdfs.map(pdf => (
          <div key={pdf.id} className={styles.row}>
            <div className={styles.iconWrap}><FileIcon /></div>
            <div className={styles.info}>
              <p className={styles.pdfName}>{pdf.name}</p>
              <div className={styles.meta}>
                <span>{pdf.pages} pages</span>
                <span className={styles.dot}>·</span>
                <span>{pdf.size}</span>
                <span className={styles.dot}>·</span>
                <span>{pdf.uploaded}</span>
              </div>
            </div>
            <div className={styles.right}>
              {pdf.chats > 0 && (
                <span className={styles.chatBadge}><ChatBubbleIcon />{pdf.chats}</span>
              )}
              <button className={styles.askBtn}>Ask AI</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
