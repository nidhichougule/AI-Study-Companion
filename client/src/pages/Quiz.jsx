function Quiz() {
  return (
    <div style={container}>
      <div style={card}>
        <h1>Quiz Generator</h1>
        <p>Generate practice questions from your uploaded notes.</p>

        <button style={button}>Generate Quiz</button>

        <div style={quizBox}>
          Quiz questions will appear here...
        </div>
      </div>
    </div>
  );
}

const container = { padding: "40px" };

const card = {
  background: "white",
  padding: "30px",
  maxWidth: "700px",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

const button = {
  padding: "12px 20px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

const quizBox = {
  marginTop: "20px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

export default Quiz;