import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Chat.module.css";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import {
  askQuestion,
  createChat,
  DATA_CHANGED_EVENT,
  getChatById,
  getChats,
  getNotes,
  notifyDataChanged,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const samplePrompts = [
  "Summarize the key findings from my uploaded notes",
  "Explain the core concept in simple terms",
  "What are the main formulas or definitions mentioned?",
  "Create 3 practice questions based on this document",
];

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedPdfIds, setSelectedPdfIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const chatEndRef = useRef(null);

  const loadDefaultChat = useCallback(async () => {
    try {
      const [chatsResponse, notesResponse] = await Promise.all([getChats(), getNotes()]);
      const chats = chatsResponse.data || [];
      setNotes(notesResponse.data || []);

      const chatIdFromQuery = searchParams.get("chatId");
      const pdfIdFromQuery = searchParams.get("pdfId");

      if (pdfIdFromQuery) {
        setSelectedPdfIds([pdfIdFromQuery]);
        setActiveChatId(null);
        setMessages([]);
        return;
      }

      if (!chats.length) {
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
    chatEndRef.current?.scrollIntoView({
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

  const handleRemoveScopePdf = (pdfId) => {
    setSelectedPdfIds((prev) => prev.filter((id) => id !== pdfId));
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

  const askAI = async (textToSend) => {
    const queryText = (typeof textToSend === "string" ? textToSend : question).trim();
    if (!queryText || loading) return;

    const updated = [...messages, { role: "user", text: queryText }];
    setMessages(updated);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askQuestion({
        question: queryText,
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
          text: "I encountered an issue generating an answer. Please verify your connection or try again.",
          sources: [],
          retrievedChunks: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askAI();
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar
        onLogout={handleLogout}
        onSelectChat={handleSelectChat}
        onSelectPdf={handleSelectPdf}
        onNewChat={handleNewChat}
        activeChatId={activeChatId}
        selectedPdfIds={selectedPdfIds}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={styles.chatArea}>
        <TopBar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

        {/* SCOPE BAR */}
        <div className={styles.scopeBar}>
          <span className={styles.scopeLabel}>Doc Scope:</span>
          {selectedPdfIds.length ? (
            <>
              {selectedPdfIds.map((pdfId) => {
                const matchedNote = notes.find((n) => n._id === pdfId);
                const displayName = matchedNote ? matchedNote.fileName : pdfId;
                return (
                  <span key={pdfId} className={styles.scopeChip} title={`Document ID: ${pdfId}`}>
                    <BookIcon />
                    {displayName}
                    <button
                      className={styles.scopeRemoveBtn}
                      onClick={() => handleRemoveScopePdf(pdfId)}
                      title="Remove from scope"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
              <button className={styles.clearScopeBtn} onClick={() => setSelectedPdfIds([])}>
                Clear Filter
              </button>
            </>
          ) : (
            <span className={styles.scopeHint}>
              All uploaded study documents ({notes.length} loaded)
            </span>
          )}
        </div>

        {/* MESSAGES VIEW */}
        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <SparklesIcon />
              </div>
              <h2 className={styles.emptyTitle}>AI Study Companion</h2>
              <p className={styles.emptySub}>
                Ask any question about your course materials, lecture notes, or textbooks. Answers are grounded in your uploaded documents.
              </p>
              <div className={styles.emptyGrid}>
                {samplePrompts.map((promptText, i) => (
                  <button
                    key={i}
                    className={styles.emptyPromptCard}
                    onClick={() => askAI(promptText)}
                  >
                    💡 {promptText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div key={index} className={`${styles.msgRow} ${isUser ? styles.userRow : styles.aiRow}`}>
                  <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.aiAvatar}`}>
                    {isUser ? (user?.name ? user.name.charAt(0).toUpperCase() : "U") : "AI"}
                  </div>

                  <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
                    <div>{message.text}</div>

                    {/* REFERENCED SOURCES */}
                    {!isUser && message.sources?.length ? (
                      <div className={styles.metaBlock}>
                        <div className={styles.metaHeader}>
                          <BookIcon /> Referenced Sources ({message.sources.length})
                        </div>
                        {message.sources.map((source, sIdx) => (
                          <div key={`${source.fileName}-${source.page}-${sIdx}`} className={styles.sourceCard}>
                            <div className={styles.sourceTop}>
                              <span className={styles.sourceName}>{source.fileName}</span>
                              <span>Page {source.page}</span>
                            </div>
                            {source.snippet ? (
                              <div className={styles.sourceSnippet}>"{source.snippet}"</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* RETRIEVED CHUNKS */}
                    {!isUser && message.retrievedChunks?.length ? (
                      <details className={styles.details}>
                        <summary className={styles.summary}>
                          🔍 View RAG Vector Chunks ({message.retrievedChunks.length})
                        </summary>
                        <div className={styles.detailsBody}>
                          {message.retrievedChunks.map((chunk) => (
                            <div key={chunk.id} className={styles.chunkCard}>
                              <div className={styles.chunkMeta}>
                                {chunk.metadata?.fileName || "Document"} · Page {chunk.metadata?.page || 1} · Similarity:{" "}
                                {typeof chunk.similarity === "number" ? chunk.similarity.toFixed(3) : "n/a"}
                              </div>
                              <div>{chunk.document}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}

          {/* AI TYPING INDICATOR */}
          {loading && (
            <div className={`${styles.msgRow} ${styles.aiRow}`}>
              <div className={`${styles.avatar} ${styles.aiAvatar}`}>AI</div>
              <div className={styles.typingIndicator}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className={styles.inputArea}>
          <div className={styles.inputWrap}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question about your study material... (Shift + Enter for new line)"
              className={styles.textarea}
              rows={1}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => askAI()}
              className={styles.sendBtn}
              disabled={loading || !question.trim()}
              title="Send Message"
            >
              <SendIcon />
            </button>
          </div>
          <div className={styles.inputHint}>
            Press Enter to send · Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

