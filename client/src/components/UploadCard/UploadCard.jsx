import styles from "./UploadCard.module.css";

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

export default function UploadCard() {
  return (
    <div className={styles.card}>
      <div className={styles.dropZone}>
        <div className={styles.iconRing}><UploadIcon /></div>
        <p className={styles.mainText}>Drop a PDF to start studying</p>
        <p className={styles.subText}>
          Upload any textbook, notes, or document — your AI tutor will read it instantly.
        </p>
        <div className={styles.btnRow}>
          <button className={styles.browseBtn}>Browse Files</button>
          <span className={styles.divider}>or</span>
          <span className={styles.hint}>drag & drop here</span>
        </div>
        <p className={styles.fileNote}>Supports PDF · Max 50MB</p>
      </div>
    </div>
  );
}
