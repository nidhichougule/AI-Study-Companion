import { useState } from "react";

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    const response = await fetch("http://localhost:5000/api/upload/pdf", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setMessage(data.error ? `${data.message}: ${data.error}` : data.message);
    setPreview(data.textPreview || "");
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1>Upload Notes</h1>
        <p>Upload your PDF study material.</p>

        <input
          type="file"
          accept=".pdf"
          style={input}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button style={button} onClick={handleUpload}>
          Upload PDF
        </button>

        <p>{message}</p>

        {preview && (
          <div style={previewBox}>
            <h3>Text Preview:</h3>
            <p>{preview}</p>
          </div>
        )}
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
const previewBox = {
  marginTop: "20px",
  padding: "15px",
  background: "#f3f4f6",
  borderRadius: "8px",
};

export default Upload;