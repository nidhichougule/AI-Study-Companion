import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={container}>
      <h1>Student Dashboard</h1>
      <p>Choose what you want to do today.</p>

      <div style={grid}>
        <Link to="/upload" style={card}>
          <h2>Upload Notes</h2>
          <p>Upload PDF study material.</p>
        </Link>

        <Link to="/chat" style={card}>
          <h2>Ask AI</h2>
          <p>Ask questions from your notes.</p>
        </Link>

        <Link to="/quiz" style={card}>
          <h2>Generate Quiz</h2>
          <p>Practice using AI-generated questions.</p>
        </Link>
      </div>
    </div>
  );
}

const container = {
  padding: "40px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "30px",
};

const card = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  color: "#111",
};

export default Dashboard;