import { useState } from "react";
import axios from "axios";

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const askAI = async () => {
    if (!question) return;

    const userMsg = { type: "user", text: question };
    setMessages([...messages, userMsg]);

    const res = await axios.post("http://localhost:5000/api/chat/ask", {
      question,
    });

    const botMsg = { type: "bot", text: res.data.answer };

    setMessages((prev) => [...prev, botMsg]);
    setQuestion("");
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>🧠 AI Study Companion</h2>

      <div style={{ minHeight: 300, border: "1px solid #ccc", padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "10px 0" }}>
            <b>{m.type === "user" ? "You" : "AI"}:</b> {m.text}
          </div>
        ))}
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your question..."
        style={{ width: "70%", padding: 8 }}
      />

      <button onClick={askAI} style={{ padding: 8, marginLeft: 10 }}>
        Ask
      </button>
    </div>
  );
}