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
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white", fontFamily: "sans-serif" }}>
      <Sidebar onLogout={handleLogout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <TopBar />
        <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 6px", color: "#f8fafc" }}>📄 Document Management Hub</h1>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
              Upload and manage your PDF study notes. All uploaded documents are indexed for instant semantic AI retrieval.
            </p>
          </div>

          <section style={{ marginBottom: "24px" }}>
            <UploadCard />
          </section>

          <section>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading documents...</div>
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