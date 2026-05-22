function Chat() {
  return (
    <div style={container}>
      <h1>Ask AI</h1>

      <div style={chatBox}>
        <p style={{ color: "#666" }}>AI answers will appear here...</p>
      </div>

      <div style={inputRow}>
        <input style={input} placeholder="Ask a question from your notes..." />
        <button style={button}>Ask</button>
      </div>
    </div>
  );
}

const container = { padding: "40px" };

const chatBox = {
  background: "white",
  height: "300px",
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