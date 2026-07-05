const { retrieveRelevantChunks } = require("../services/retrievalService");

const searchChunks = async (req, res) => {
  try {
    const { question, topK, pdfIds } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    const { retrievedChunks, sources } = await retrieveRelevantChunks({
      question: question.trim(),
      userId: req.user?.id,
      topK: Number(topK) || 5,
      noteIds: Array.isArray(pdfIds) && pdfIds.length ? pdfIds : undefined,
    });

    res.json({
      sources,
      retrievedChunks,
    });
  } catch (error) {
    console.error("Retrieval search failed:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { searchChunks };