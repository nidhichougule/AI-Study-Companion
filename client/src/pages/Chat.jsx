import { useState } from "react";

function Chat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    if (!question) {
      setAnswer("Please enter a question.");
      return;
    }

    const response = await fetch("http://localhost:5000/api/chat/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();
    setAnswer(data.answer || `${data.message}: ${data.error}`);
  };

  return (
    <div style={container}>
      <h1>Ask AI</h1>

      <div style={chatBox}>
        <p>{answer || "AI answers will appear here..."}</p>
      </div>

      <div style={inputRow}>
        <input
          style={input}
          placeholder="Ask a question from your notes..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button style={button} onClick={handleAsk}>
          Ask
        </button>
      </div>
    </div>
  );
}

const container = { padding: "40px" };

const chatBox = {
  background: "white",
  minHeight: "300px",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

const inputRow = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const input = {
  flex: 1,
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const button = {
  padding: "12px 20px",
  background: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

export default Chat;