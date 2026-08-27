import { useRef, useState } from "react";
import styles from "./UploadCard.module.css";
import { notifyDataChanged, uploadPDF } from "../../services/api";

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const uploadFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf")) {
      showToast("Invalid file format. Only PDF files are supported.", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast("File is larger than the 50MB size limit.", "error");
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

      showToast(`"${file.name}" uploaded & indexed successfully.`, "success");
      notifyDataChanged();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      const message =
        error?.response?.data?.message || "PDF processing failed. Please try again.";
      showToast(message, "error");
    } finally {
      setUploading(false);
      setIsDragOver(false);
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = async (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer?.files?.[0];
    await uploadFile(file);
  };

  return (
    <div className={styles.card}>
      {toast ? (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "error" ? "❌ " : "✅ "}
          {toast.message}
        </div>
      ) : null}

      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
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
        <p className={styles.mainText}>Drop PDF document to start AI indexing</p>
        <p className={styles.subText}>
          Upload textbooks, lecture slides, or exam notes. Your AI companion will parse, chunk, and index them instantly.
        </p>

        {uploading ? (
          <div className={styles.uploadingBox}>
            <div className={styles.progressText}>Uploading &amp; Processing ({uploadProgress}%)</div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <div className={styles.btnRow}>
            <button className={styles.browseBtn} type="button" disabled={uploading}>
              Browse PDF Files
            </button>
            <span className={styles.divider}>or</span>
            <span className={styles.hint}>drag &amp; drop file here</span>
          </div>
        )}

        <p className={styles.fileNote}>Supports PDF files up to 50MB</p>
      </div>
    </div>
  );
}

