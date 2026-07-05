import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import {
  askQuestion,
  createChat,
  DATA_CHANGED_EVENT,
  getChatById,
  getChats,
  notifyDataChanged,
} from "../services/api";

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedPdfIds, setSelectedPdfIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  const loadDefaultChat = useCallback(async () => {
    try {
      const chatsResponse = await getChats();
      const chats = chatsResponse.data || [];
      if (!chats.length) {
        setActiveChatId(null);
        setMessages([]);
        return;
      }

      const chatIdFromQuery = searchParams.get("chatId");
      const pdfIdFromQuery = searchParams.get("pdfId");

      if (pdfIdFromQuery) {
        setSelectedPdfIds([pdfIdFromQuery]);
        setActiveChatId(null);
        setMessages([]);
        return;
      }

      const targetChat = chatIdFromQuery
        ? chats.find((chat) => chat._id === chatIdFromQuery) || chats[0]
        : chats[0];

      setActiveChatId(targetChat._id);
      setSelectedPdfIds(targetChat.pdfIds || []);
      setMessages(targetChat.messages || []);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    loadDefaultChat();
  }, [loadDefaultChat]);

  useEffect(() => {
    const listener = () => loadDefaultChat();
    window.addEventListener(DATA_CHANGED_EVENT, listener);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, listener);
  }, [loadDefaultChat]);

  useEffect(() => {
    chatRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSelectChat = async (chat) => {
    try {
      const chatResponse = await getChatById(chat._id);
      const selected = chatResponse.data;

      setActiveChatId(selected._id);
      setSelectedPdfIds(selected.pdfIds || []);
      setMessages(selected.messages || []);
      setSearchParams({ chatId: selected._id });
    } catch (error) {
      console.error("Chat load failed:", error);
    }
  };

  const handleSelectPdf = (note) => {
    setSelectedPdfIds((current) => {
      if (current.includes(note._id)) {
        return current.filter((pdfId) => pdfId !== note._id);
      }
      return [...current, note._id];
    });
    setActiveChatId(null);
    setMessages([]);
    setSearchParams({ pdfId: note._id });
  };

  const handleNewChat = async () => {
    try {
      const response = await createChat({
        pdfIds: selectedPdfIds,
      });
      const chat = response.data?.chat;
      if (!chat) return;

      setActiveChatId(chat._id);
      setMessages([]);
      setSearchParams({ chatId: chat._id });
      notifyDataChanged();
    } catch (error) {
      console.error("Create chat failed:", error);
    }
  };

  const askAI = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    const updated = [...messages, { role: "user", text: trimmedQuestion }];
    setMessages(updated);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askQuestion({
        question: trimmedQuestion,
        chatId: activeChatId || undefined,
        pdfIds: selectedPdfIds,
      });

      const aiMessage = {
        role: "ai",
        text: response.data?.answer || "",
        sources: response.data?.sources || [],
        retrievedChunks: response.data?.retrievedChunks || [],
      };

      setMessages([...updated, aiMessage]);

      if (response.data?.chat?._id) {
        setActiveChatId(response.data.chat._id);
        setSelectedPdfIds(response.data.chat.pdfIds || selectedPdfIds);
        setSearchParams({ chatId: response.data.chat._id });
      }

      notifyDataChanged();
    } catch (error) {
      console.error("Ask AI failed:", error);
      setMessages([
        ...updated,
        {
          role: "ai",
          text: "I could not generate an answer right now. Please try again.",
          sources: [],
          retrievedChunks: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar
        onLogout={handleLogout}
        onSelectChat={handleSelectChat}
        onSelectPdf={handleSelectPdf}
        onNewChat={handleNewChat}
        activeChatId={activeChatId}
        selectedPdfIds={selectedPdfIds}
      />

      <div style={styles.chatArea}>
        <div style={styles.scopeBar}>
          <span style={styles.scopeLabel}>Scoped PDFs:</span>
          {selectedPdfIds.length ? (
            selectedPdfIds.map((pdfId) => (
              <span key={pdfId} style={styles.scopeChip}>
                {pdfId}
              </span>
            ))
          ) : (
            <span style={styles.scopeHint}>All uploaded PDFs</span>
          )}
        </div>

        <div style={styles.messages}>
          {messages.map((message, index) => (
            <div key={index} style={message.role === "user" ? styles.userMsg : styles.aiMsg}>
              <div>{message.text}</div>

              {message.role === "ai" && message.sources?.length ? (
                <div style={styles.metaBlock}>
                  <div style={styles.metaTitle}>Sources</div>
                  {message.sources.map((source, sourceIndex) => (
                    <div key={`${source.fileName}-${source.page}-${sourceIndex}`} style={styles.metaLine}>
                      {source.fileName} · page {source.page}
                    </div>
                  ))}
                </div>
              ) : null}

              {message.role === "ai" && message.retrievedChunks?.length ? (
                <details style={styles.details}>
                  <summary style={styles.summary}>
                    Retrieved Chunks ({message.retrievedChunks.length})
                  </summary>
                  <div style={styles.detailsBody}>
                    {message.retrievedChunks.map((chunk) => (
                      <div key={chunk.id} style={styles.chunkCard}>
                        <div style={styles.chunkMeta}>
                          {chunk.metadata?.fileName || "unknown"} · page {chunk.metadata?.page || 1} · similarity{" "}
                          {typeof chunk.similarity === "number" ? chunk.similarity.toFixed(3) : "n/a"}
                        </div>
                        <div>{chunk.document}</div>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          ))}

          {loading && <div style={styles.aiMsg}>AI is thinking...</div>}
          <div ref={chatRef}></div>
        </div>

        <div style={styles.inputBox}>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something..."
            style={styles.input}
            onKeyDown={(event) => {
              if (event.key === "Enter") askAI();
            }}
          />

          <button onClick={askAI} style={styles.button} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "sans-serif",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  scopeBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid #1f2937",
    background: "#0b1220",
    flexWrap: "wrap",
  },
  scopeLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  scopeHint: {
    fontSize: 12,
    color: "#475569",
  },
  scopeChip: {
    fontSize: 11,
    background: "rgba(59,130,246,0.15)",
    color: "#93c5fd",
    border: "1px solid rgba(59,130,246,0.25)",
    borderRadius: 999,
    padding: "4px 8px",
  },
  messages: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },
  userMsg: {
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    padding: 12,
    margin: "10px 0",
    borderRadius: 12,
    alignSelf: "flex-end",
    maxWidth: "80%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  aiMsg: {
    background: "#1f2937",
    padding: 12,
    margin: "10px 0",
    borderRadius: 12,
    alignSelf: "flex-start",
    maxWidth: "85%",
    border: "1px solid #374151",
  },
  metaBlock: {
    marginTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: 8,
    fontSize: 12,
  },
  metaTitle: {
    color: "#93c5fd",
    fontWeight: 600,
    marginBottom: 4,
  },
  metaLine: {
    color: "#cbd5e1",
    marginBottom: 3,
  },
  details: {
    marginTop: 8,
    fontSize: 12,
  },
  summary: {
    cursor: "pointer",
    color: "#93c5fd",
  },
  detailsBody: {
    marginTop: 8,
    display: "grid",
    gap: 8,
  },
  chunkCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 8,
    background: "rgba(15,23,42,0.45)",
    lineHeight: 1.5,
  },
  chunkMeta: {
    color: "#94a3b8",
    marginBottom: 5,
    fontSize: 11,
  },
  inputBox: {
    display: "flex",
    padding: 12,
    background: "#0b1220",
    borderTop: "1px solid #1f2937",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "none",
    outline: "none",
  },
  button: {
    marginLeft: 10,
    padding: 10,
    background: "#3b82f6",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: 6,
  },
};
