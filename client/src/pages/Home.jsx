import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ padding: "80px 30px", textAlign: "center" }}>
      <h1 style={{ fontSize: "42px", color: "#1e40af" }}>
        AI Study Companion
      </h1>

      <p style={{ fontSize: "18px", color: "#555" }}>
        Upload notes, ask questions, and generate quizzes using AI.
      </p>

      <div style={{ marginTop: "30px" }}>
        <Link to="/login">
          <button style={btnBlue}>Login</button>
        </Link>

        <Link to="/signup">
          <button style={btnGreen}>Sign Up</button>
        </Link>
      </div>
    </div>
  );
}

const btnBlue = {
  padding: "12px 24px",
  margin: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

const btnGreen = {
  ...btnBlue,
  background: "#16a34a",
};

export default Home;