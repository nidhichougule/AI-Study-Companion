import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askAI = async () => {
    if (!question.trim()) return;

    const updated = [...messages, { role: "user", text: question }];
    setMessages(updated);
    setQuestion("");
    setLoading(true);

    const res = await axios.post("http://localhost:5000/api/chat/ask", {
      question,
    });

    setMessages([...updated, { role: "ai", text: res.data.answer }]);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chat with AI</h2>

      <div style={{ height: 400, overflowY: "auto", border: "1px solid #ccc", padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "10px 0" }}>
            <b>{m.role === "user" ? "You" : "AI"}:</b> {m.text}
          </div>
        ))}

        {loading && <div>AI is thinking...</div>}

        <div ref={chatRef}></div>
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
      />

      <button onClick={askAI}>Send</button>
    </div>
  );
}