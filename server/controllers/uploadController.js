const { splitIntoChunks } = require("../services/chunkService");
const { generateEmbedding } = require("../services/embeddingService");
const { addChunksToDB } = require("../services/vectorStore");

const fs = require("fs");
const pdfParse = require("pdf-parse");
const Note = require("../models/Note");

const uploadPDF = async (req, res) => {
  try {
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);

    // 1. Chunk text
    const chunks = splitIntoChunks(pdfData.text);

    // 2. Embeddings
    const embeddings = [];

    for (let chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      embeddings.push(embedding);
    }

    // 3. Store in ChromaDB ONLY
    await addChunksToDB(chunks, embeddings, req.file.originalname);

    console.log("Chunks stored in ChromaDB");

    // Save only metadata (optional)
    const note = await Note.create({
      userId: req.user ? req.user.id : null,
      fileName: req.file.originalname,
      extractedText: pdfData.text,
    });

    res.status(201).json({
      message: "PDF processed with RAG successfully",
      noteId: note._id,
      fileName: note.fileName,
    });

  } catch (error) {
    console.log("PDF upload error:", error);

    res.status(500).json({
      message: "PDF upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadPDF };