function Upload() {
  return (
    <div style={container}>
      <div style={card}>
        <h1>Upload Notes</h1>
        <p>Upload your PDF study material.</p>

        <input type="file" accept=".pdf" style={input} />

        <button style={button}>Upload PDF</button>
      </div>
    </div>
  );
}

const container = { padding: "40px" };

const card = {
  background: "white",
  padding: "30px",
  maxWidth: "500px",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

const input = {
  width: "100%",
  padding: "12px",
  margin: "20px 0",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const button = {
  padding: "12px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

export default Upload;