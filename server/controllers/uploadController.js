const Chunk = require("../models/Chunk");
const { splitIntoChunks } = require("../services/chunkService");
// const { splitIntoChunks } = require("../services/chunkService");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Note = require("../models/Note");

const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    const chunks = await splitIntoChunks(pdfData.text);
    for (let i = 0; i < chunks.length; i++) {
  await Chunk.create({
    userId: req.user ? req.user.id : null,
    fileName: req.file.originalname,
    chunkIndex: i,
    content: chunks[i],
  });
}
    console.log("Total Chunks:", chunks.length);
    console.log("First Chunk:");
    console.log(chunks[0]);
    const note = await Note.create({
      userId: req.user ? req.user.id : null,
      fileName: req.file.originalname,
      extractedText: pdfData.text,
});
    res.status(201).json({
      message: "PDF uploaded and text extracted successfully",
      noteId: note._id,
      fileName: note.fileName,
      textPreview: pdfData.text.substring(0, 300),
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