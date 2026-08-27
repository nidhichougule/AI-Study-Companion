import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import UploadCard from "../components/UploadCard/UploadCard";
import RecentPDFs from "../components/RecentPDFs/RecentPDFs";
import { DATA_CHANGED_EVENT, getChats, getNotes } from "../services/api";

export default function Upload() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [notesRes, chatsRes] = await Promise.all([getNotes(), getChats()]);
      setNotes(notesRes.data || []);
      setChats(chatsRes.data || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const listener = () => loadData();
    window.addEventListener(DATA_CHANGED_EVENT, listener);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, listener);
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-dark)", color: "var(--text-main)", fontFamily: "var(--font-sans)", overflow: "hidden" }}>
      <Sidebar
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0 }}>
        <TopBar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main style={{ padding: "28px", maxWidth: "1040px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 6px", color: "var(--text-main)", letterSpacing: "-0.4px" }}>
              📄 Document Management Hub
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              Upload and manage your PDF study notes. All uploaded documents are indexed for instant semantic AI retrieval and practice quiz generation.
            </p>
          </div>

          <section style={{ marginBottom: "28px" }}>
            <UploadCard />
          </section>

          <section>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "14px" }}>Loading documents...</div>
            ) : (
              <RecentPDFs
                notes={notes}
                chats={chats}
                showDelete={true}
                onSelectPdf={(pdfId) => navigate(`/chat?pdfId=${pdfId}`)}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}