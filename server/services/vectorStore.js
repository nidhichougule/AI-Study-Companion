const { ChromaClient } = require("chromadb");

const client = new ChromaClient();

const getCollection = async () => {
  return await client.getOrCreateCollection({
    name: "study_chunks",
    metadata: {
      "hnsw:space": "cosine",
    },
  });
};

const addChunksToDB = async ({ chunkItems, embeddings, fileName, userId, noteId }) => {
  const collection = await getCollection();
  const safeEmbeddings = embeddings.map((embedding) =>
    Array.isArray(embedding) ? embedding : Array.from(embedding || [])
  );

  const normalizedChunkItems = Array.isArray(chunkItems) ? chunkItems : [];

  await collection.add({
    ids: normalizedChunkItems.map((_, i) => `${noteId}-chunk-${i}`),
    documents: normalizedChunkItems.map((item) => item.text),
    embeddings: safeEmbeddings,
    metadatas: normalizedChunkItems.map((item, i) => ({
      noteId: String(noteId),
      userId: String(userId),
      fileName,
      page: Number(item.page) || 1,
      chunkIndex: i,
    })),
  });
};

const buildChromaWhereFilter = ({ userId, noteIds }) => {
  const filters = [];

  if (userId) {
    filters.push({ userId: String(userId) });
  }

  if (Array.isArray(noteIds) && noteIds.length) {
    filters.push({
      noteId: {
        $in: noteIds.map((id) => String(id)),
      },
    });
  }

  if (!filters.length) return undefined;
  if (filters.length === 1) return filters[0];
  return { $and: filters };
};

const searchSimilarChunks = async ({ queryEmbedding, topK = 5, userId, noteIds }) => {
  const startedAt = Date.now();
  const collection = await getCollection();
  const where = buildChromaWhereFilter({ userId, noteIds });

  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    where,
    include: ["documents", "metadatas", "distances", "embeddings"],
  });

  const elapsedMs = Date.now() - startedAt;
  const matchCount = result?.ids?.[0]?.length || 0;
  console.log(
    `[RAG] Vector search complete in ${elapsedMs}ms | topK=${topK} | matches=${matchCount} | user=${String(
      userId || "unknown"
    )} | noteFilterCount=${Array.isArray(noteIds) ? noteIds.length : 0}`
  );

  return result;
};

const getChunksByNoteId = async ({ noteId, userId }) => {
  const collection = await getCollection();

  const result = await collection.get({
    where: {
      noteId: String(noteId),
      ...(userId ? { userId: String(userId) } : {}),
    },
    include: ["documents", "metadatas"],
  });

  return result;
};

module.exports = {
  addChunksToDB,
  searchSimilarChunks,
  getChunksByNoteId,
};