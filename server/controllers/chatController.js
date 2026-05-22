const Note = require("../models/Note");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const latestNote = await Note.findOne().sort({ createdAt: -1 });

    if (!latestNote) {
      return res.status(404).json({ message: "Upload a PDF first." });
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an AI study assistant. Answer using the uploaded PDF notes. Write naturally in your own words. Do not copy the answer directly unless necessary.",
        },
        {
          role: "user",
          content: `
Uploaded PDF Notes:
${latestNote.extractedText}

User Question:
${question}
`,
        },
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({
      message: "Groq AI question answering failed",
      error: error.message,
    });
  }
};

module.exports = { askQuestion };