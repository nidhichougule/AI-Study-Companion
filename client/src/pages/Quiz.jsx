import { useState } from "react";

function Quiz() {
  const [quiz, setQuiz] = useState([]);
  const [message, setMessage] = useState("");

  const handleGenerateQuiz = async () => {
    const response = await fetch("http://localhost:5000/api/quiz/generate");
    const data = await response.json();

    setMessage(data.message);
    setQuiz(data.quiz || []);
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1>Quiz Generator</h1>
        <p>Generate practice questions from your uploaded notes.</p>

        <button style={button} onClick={handleGenerateQuiz}>
          Generate Quiz
        </button>

        <p>{message}</p>

        <div style={quizBox}>
          {quiz.length === 0 ? (
            <p>Quiz questions will appear here...</p>
          ) : (
            quiz.map((item) => (
              <div key={item.id} style={questionCard}>
                <strong>{item.question}</strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const container = { padding: "40px" };
const card = {
  background: "white",
  padding: "30px",
  maxWidth: "800px",
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
};
const questionCard = {
  padding: "15px",
  marginBottom: "12px",
  background: "#f3f4f6",
  borderRadius: "8px",
};

export default Quiz;