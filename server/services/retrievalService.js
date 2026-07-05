const { generateEmbedding } = require("./embeddingService");
const { searchSimilarChunks, getChunksByNoteId } = require("./vectorStore");

const normalizeRetrievedChunks = (result) => {
  const documents = result?.documents?.[0] || [];
  const metadatas = result?.metadatas?.[0] || [];
  const ids = result?.ids?.[0] || [];
  const distances = result?.distances?.[0] || [];
  const embeddings = result?.embeddings?.[0] || [];

  return documents.map((document, index) => ({
    id: ids[index],
    document,
    metadata: metadatas[index] || {},
    distance: Number.isFinite(distances[index]) ? distances[index] : null,
    embedding: Array.isArray(embeddings[index]) ? embeddings[index] : null,
  }));
};

const cosineSimilarity = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || !vectorA.length || !vectorB.length) {
    return null;
  }

  const dimensions = Math.min(vectorA.length, vectorB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < dimensions; index += 1) {
    const a = Number(vectorA[index]) || 0;
    const b = Number(vectorB[index]) || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (!normA || !normB) return null;
  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Number(similarity.toFixed(6));
};

const dedupeAndRankChunks = (chunks, topK, queryEmbedding) => {
  const seen = new Set();
  const unique = [];

  for (const chunk of chunks) {
    const textKey = String(chunk.document || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (!textKey || seen.has(textKey)) continue;
    seen.add(textKey);

    unique.push({
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    });
  }

  unique.sort((a, b) => {
    const aSimilarity = Number.isFinite(a.similarity) ? a.similarity : Number.NEGATIVE_INFINITY;
    const bSimilarity = Number.isFinite(b.similarity) ? b.similarity : Number.NEGATIVE_INFINITY;

    if (bSimilarity !== aSimilarity) return bSimilarity - aSimilarity;

    const aDistance = Number.isFinite(a.distance) ? a.distance : Number.POSITIVE_INFINITY;
    const bDistance = Number.isFinite(b.distance) ? b.distance : Number.POSITIVE_INFINITY;
    return aDistance - bDistance;
  });

  return unique.slice(0, topK);
};

const retrieveRelevantChunks = async ({ question, userId, topK = 5, noteIds }) => {
  const retrievalTopK = Math.max(topK * 4, 20);
  const queryEmbedding = await generateEmbedding(question);
  const result = await searchSimilarChunks({
    queryEmbedding,
    topK: retrievalTopK,
    userId,
    noteIds,
  });

  const rankedChunks = dedupeAndRankChunks(normalizeRetrievedChunks(result), topK, queryEmbedding).map(
    ({ embedding, ...chunk }) => chunk
  );
  console.log(`[RAG] Retrieved chunk count after dedupe/rank: ${rankedChunks.length}`);

  const sourcesMap = new Map();
  for (const chunk of rankedChunks) {
    const fileName = chunk.metadata.fileName || "unknown";
    const page = Number(chunk.metadata.page) || 1;
    const sourceKey = `${fileName}::${page}`;

    if (!sourcesMap.has(sourceKey)) {
      sourcesMap.set(sourceKey, { fileName, page });
    }
  }

  const sources = [...sourcesMap.values()];

  return {
    retrievedChunks: rankedChunks,
    sources,
  };
};

const getAllChunksForNote = async ({ noteId, userId }) => {
  const result = await getChunksByNoteId({ noteId, userId });

  return normalizeRetrievedChunks({
    documents: [result.documents || []],
    metadatas: [result.metadatas || []],
    ids: [result.ids || []],
    distances: [[]],
  });
};

const buildRagPrompt = ({ question, retrievedChunks }) => {
  const context = retrievedChunks.length
    ? retrievedChunks
        .map(
          (chunk, index) =>
            `Chunk ${index + 1} [${chunk.metadata.fileName || "unknown"}, page ${
              Number(chunk.metadata.page) || 1
            }, similarity ${chunk.similarity ?? "n/a"}]:\n${chunk.document}`
        )
        .join("\n\n")
    : "No relevant chunks were retrieved from the study materials.";

  return `You are an AI study assistant. Answer using only the retrieved context below.\n\nRetrieved Context:\n${context}\n\nQuestion:\n${question}\n\nAnswer in simple words:`;
};

module.exports = {
  retrieveRelevantChunks,
  getAllChunksForNote,
  buildRagPrompt,
};