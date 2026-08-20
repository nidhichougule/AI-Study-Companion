const { retrieveRelevantChunks } = require("../services/retrievalService");

const searchChunks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { question, topK, pdfIds } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    const { retrievedChunks, sources, hasRelevantContext } = await retrieveRelevantChunks({
      question: question.trim(),
      userId: req.user.id,
      topK: Number(topK) || 5,
      noteIds: Array.isArray(pdfIds) && pdfIds.length ? pdfIds : undefined,
    });

    res.json({
      sources,
      retrievedChunks,
      hasRelevantContext,
    });
  } catch (error) {
    console.error("Retrieval search failed:", error.message);
    res.status(500).json({
      message: "Retrieval search failed",
    });
  }
};

module.exports = { searchChunks };