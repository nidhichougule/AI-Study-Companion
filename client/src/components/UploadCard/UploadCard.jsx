import { useRef, useState } from "react";
import styles from "./UploadCard.module.css";
import { notifyDataChanged, uploadPDF } from "../../services/api";

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export default function UploadCard() {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const uploadFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are supported.", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast("File is larger than 50MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      await uploadPDF(formData, (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(percent);
      });

      showToast("PDF uploaded successfully.", "success");
      notifyDataChanged();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      const message =
        error?.response?.data?.message || "PDF upload failed. Please try again.";
      showToast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    await uploadFile(file);
  };

  return (
    <div className={styles.card}>
      {toast ? (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.message}
        </div>
      ) : null}

      <div
        className={styles.dropZone}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          className={styles.hiddenInput}
          type="file"
          accept="application/pdf"
          onChange={(event) => uploadFile(event.target.files?.[0])}
        />

        <div className={styles.iconRing}>
          <UploadIcon />
        </div>
        <p className={styles.mainText}>Drop a PDF to start studying</p>
        <p className={styles.subText}>
          Upload any textbook, notes, or document — your AI tutor will read it instantly.
        </p>
        <div className={styles.btnRow}>
          <button className={styles.browseBtn} type="button" disabled={uploading}>
            {uploading ? `Uploading ${uploadProgress}%` : "Browse Files"}
          </button>
          <span className={styles.divider}>or</span>
          <span className={styles.hint}>drag &amp; drop here</span>
        </div>

        {uploading ? (
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
          </div>
        ) : null}

        <p className={styles.fileNote}>Supports PDF · Max 50MB</p>
      </div>
    </div>
  );
}
