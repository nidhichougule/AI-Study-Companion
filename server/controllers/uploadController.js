const { splitPdfIntoChunks } = require("../services/chunkService");
const { generateEmbedding } = require("../services/embeddingService");
const { addChunksToDB } = require("../services/vectorStore");

const fs = require("fs");
const pdfParse = require("pdf-parse");
const Note = require("../models/Note");

const uploadPDF = async (req, res) => {
  try {
    console.log("FILE:", req.file?.originalname);
    console.log("USER:", req.user?.id);

    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    const pageCount = Number(pdfData?.numpages) || 0;

    // 1. Extract + semantic chunking
    const chunkItems = splitPdfIntoChunks(pdfData.text);
    if (!chunkItems.length) {
      return res.status(400).json({ message: "No extractable text found in PDF" });
    }

    const note = await Note.create({
      userId: req.user ? req.user.id : null,
      fileName: req.file.originalname,
      chunkCount: chunkItems.length,
      pageCount,
      pdfTextLength: pdfData.text.length,
    });

    // 2. Embeddings
    const embeddings = [];

    for (const chunkItem of chunkItems) {
      const embedding = await generateEmbedding(chunkItem.text);
      embeddings.push(embedding);
    }

    // 3. Store chunks + embeddings in ChromaDB; only metadata lives in MongoDB.
    await addChunksToDB({
      chunkItems,
      embeddings,
      fileName: req.file.originalname,
      userId: req.user ? req.user.id : null,
      noteId: note._id,
    });

    console.log("Chunks stored in ChromaDB");

    res.status(201).json({
      message: "PDF processed with RAG successfully",
      noteId: note._id,
      fileName: note.fileName,
      pageCount: note.pageCount,
      chunkCount: note.chunkCount,
    });

  } catch (error) {
    console.error("PDF upload error:", error);

    res.status(500).json({
      message: "PDF upload failed",
      error: error.message,
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to clean up uploaded file:", unlinkError.message);
      }
    }
  }
};

module.exports = { uploadPDF };