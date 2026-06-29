import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  // smooth scroll
  useEffect(() => {
    chatRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // LOAD CHATS
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/chats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data || [];
        setChats(data);

        if (data.length > 0) {
          setActiveChat(data[0]);
          setMessages(data[0].messages || []);
        }
      } catch (err) {
        console.log("Chat load error:", err);
      }
    };

    fetchChats();
  }, []);

  // SEND MESSAGE
  const askAI = async () => {
    if (!question.trim()) return;

    const updated = [
      ...messages,
      { role: "user", text: question },
    ];

    setMessages(updated);
    setQuestion("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/chat/ask",
        {
          question,
          chatId: activeChat?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages([
        ...updated,
        { role: "ai", text: res.data.answer },
      ]);

      if (res.data.chat) {
        setActiveChat(res.data.chat);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  // CREATE NEW CHAT
  const newChat = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chat = res.data.chat;

      setChats([chat, ...chats]);
      setActiveChat(chat);
      setMessages([]);
    } catch (err) {
      console.log(err);
    }
  };

  // SWITCH CHAT
  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages(chat.messages || []);
  };

  // PDF UPLOAD
  const uploadPDF = async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/api/upload/pdf",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("PDF uploaded successfully ✔");
    } catch (err) {
      alert("Upload failed ❌");
    }
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3 style={{ marginBottom: 10 }}>💬 Chats</h3>

        <button style={styles.newBtn} onClick={newChat}>
          + New Chat
        </button>

        <div style={{ marginBottom: 15 }}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => uploadPDF(e.target.files[0])}
          />
        </div>

        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => selectChat(chat)}
            style={{
              ...styles.chatItem,
              background:
                activeChat?._id === chat._id
                  ? "#1f2937"
                  : "transparent",
            }}
          >
            {chat.title || "New Chat"}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div style={styles.chatArea}>
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div
              key={i}
              className="msg"
              style={
                m.role === "user"
                  ? styles.userMsg
                  : styles.aiMsg
              }
            >
              {m.text}
            </div>
          ))}

          {loading && (
            <div style={styles.aiMsg}>AI is thinking...</div>
          )}

          <div ref={chatRef}></div>
        </div>

        {/* INPUT */}
        <div style={styles.inputBox}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something..."
            style={styles.input}
          />

          <button onClick={askAI} style={styles.button}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🎨 STYLES (ChatGPT-like dark UI) */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "sans-serif",
  },

  sidebar: {
    width: "260px",
    background: "#111827",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #1f2937",
  },

  newBtn: {
    padding: 10,
    marginBottom: 10,
    background: "#22c55e",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: 6,
  },

  chatItem: {
    padding: 10,
    cursor: "pointer",
    borderRadius: 6,
    marginBottom: 6,
    transition: "0.2s",
  },

  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
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
    maxWidth: "70%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },

  aiMsg: {
    background: "#1f2937",
    padding: 12,
    margin: "10px 0",
    borderRadius: 12,
    alignSelf: "flex-start",
    maxWidth: "70%",
    border: "1px solid #374151",
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