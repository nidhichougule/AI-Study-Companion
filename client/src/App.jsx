import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askAI = async () => {
    if (!question.trim()) return;

    const updated = [...messages, { role: "user", text: question }];
    setMessages(updated);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat/ask", {
        question,
      });

      setMessages([
        ...updated,
        { role: "ai", text: res.data.answer },
      ]);
    } catch (err) {
      setMessages([
        ...updated,
        { role: "ai", text: "Error getting response ❌" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <div className="header">🧠 AI Study Companion</div>

      <div className="chatBox">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="msg ai">
            AI is thinking...
            <span className="dots">...</span>
          </div>
        )}

        {/* scroll anchor */}
        <div ref={chatRef}></div>
      </div>

      <form
        className="inputBox"
        onSubmit={(e) => {
          e.preventDefault();
          askAI();
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question..."
        />

        <button type="submit">Send</button>
      </form>
    </div>
  );
}