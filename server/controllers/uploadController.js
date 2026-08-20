const { splitPdfIntoChunks } = require("../services/chunkService");
const { generateEmbedding } = require("../services/embeddingService");
const { addChunksToDB } = require("../services/vectorStore");

const fs = require("fs");
const pdfParse = require("pdf-parse");
const Note = require("../models/Note");

const uploadPDF = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required to upload study material." });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file was uploaded" });
    }

    if (!req.file.originalname.toLowerCase().endsWith(".pdf") && req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are supported." });
    }

    console.log(`[Upload] Processing PDF "${req.file.originalname}" for userId=${req.user.id}`);

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    const pageCount = Number(pdfData?.numpages) || 1;

    // 1. Extract + semantic chunking
    const chunkItems = splitPdfIntoChunks(pdfData.text);
    if (!chunkItems.length) {
      return res.status(400).json({ message: "No extractable text found in PDF." });
    }

    const note = await Note.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      chunkCount: chunkItems.length,
      pageCount,
      pdfTextLength: pdfData.text.length,
    });

    // 2. Generate Embeddings for each chunk
    const embeddings = [];
    for (const chunkItem of chunkItems) {
      const embedding = await generateEmbedding(chunkItem.text);
      embeddings.push(embedding);
    }

    // 3. Store vectors in Vector DB with strict user isolation metadata
    await addChunksToDB({
      chunkItems,
      embeddings,
      fileName: req.file.originalname,
      userId: req.user.id,
      noteId: note._id,
    });

    console.log(`[Upload] Successfully processed noteId=${note._id} with ${chunkItems.length} chunks`);

    res.status(201).json({
      message: "PDF processed with RAG successfully",
      noteId: note._id,
      fileName: note.fileName,
      pageCount: note.pageCount,
      chunkCount: note.chunkCount,
    });

  } catch (error) {
    console.error("[Upload Error] PDF processing failed:", error.message);

    res.status(500).json({
      message: "PDF processing failed. Please ensure the file is a valid PDF.",
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to clean up uploaded temporary file:", unlinkError.message);
      }
    }
  }
};

module.exports = { uploadPDF };