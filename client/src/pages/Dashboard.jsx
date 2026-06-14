import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{ padding: 30 }}>
      <h1>🧠 AI Study Companion Dashboard</h1>

      <div style={{ marginTop: 20 }}>
        <Link to="/chat">
          <button>Go to Chatbot 💬</button>
        </Link>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link to="/upload">
          <button>Upload PDF 📄</button>
        </Link>
      </div>
    </div>
  );
}