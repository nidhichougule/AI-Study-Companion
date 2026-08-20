const { ChromaClient } = require("chromadb");

let chromaClient = null;
try {
  const host = process.env.CHROMA_SERVER_HOST || "localhost";
  const port = process.env.CHROMA_SERVER_PORT || 8000;
  chromaClient = new ChromaClient({ path: `http://${host}:${port}` });
} catch (err) {
  console.warn(`[VectorStore Warning] ChromaClient initialization failed (${err.message}). Using in-memory vector store.`);
}

// In-Memory Vector Store Fallback (used when ChromaDB is not running locally)
const inMemoryStore = new Map(); // id -> { id, document, embedding, metadata }

const cosineSimilarity = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || !vectorA.length || !vectorB.length) return 0;
  const dim = Math.min(vectorA.length, vectorB.length);
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < dim; i += 1) {
    const a = vectorA[i] || 0;
    const b = vectorB[i] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const getCollection = async () => {
  if (!chromaClient) return null;
  try {
    return await chromaClient.getOrCreateCollection({
      name: "study_chunks",
      metadata: { "hnsw:space": "cosine" },
    });
  } catch (err) {
    console.warn(`[VectorStore Warning] Could not connect to ChromaDB collection (${err.message}). Using in-memory fallback.`);
    return null;
  }
};

const addChunksToDB = async ({ chunkItems, embeddings, fileName, userId, noteId }) => {
  const collection = await getCollection();
  const normalizedChunkItems = Array.isArray(chunkItems) ? chunkItems : [];
  const safeEmbeddings = embeddings.map((embedding) =>
    Array.isArray(embedding) ? embedding : Array.from(embedding || [])
  );

  const ids = normalizedChunkItems.map((item, i) => `${noteId}-chunk-${item.chunkIndex ?? i}`);
  const metadatas = normalizedChunkItems.map((item, i) => {
    const chunkIdx = item.chunkIndex ?? i;
    return {
      chunkId: `${noteId}-chunk-${chunkIdx}`,
      noteId: String(noteId),
      userId: String(userId),
      fileName: String(fileName || "unnamed.pdf"),
      page: Number(item.page) || 1,
      chunkIndex: Number(chunkIdx),
    };
  });

  if (collection) {
    try {
      await collection.add({
        ids,
        documents: normalizedChunkItems.map((item) => item.text),
        embeddings: safeEmbeddings,
        metadatas,
      });
      console.log(`[VectorStore] Inserted ${ids.length} chunks into ChromaDB for noteId=${noteId}`);
      return;
    } catch (error) {
      console.warn(`[VectorStore Warning] ChromaDB add failed (${error.message}). Saving to in-memory store.`);
    }
  }

  // Fallback to in-memory store
  normalizedChunkItems.forEach((item, i) => {
    const chunkId = ids[i];
    inMemoryStore.set(chunkId, {
      id: chunkId,
      document: item.text,
      embedding: safeEmbeddings[i],
      metadata: metadatas[i],
    });
  });
  console.log(`[VectorStore] Inserted ${ids.length} chunks into In-Memory vector store for noteId=${noteId}`);
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

  if (collection) {
    try {
      const result = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        where,
        include: ["documents", "metadatas", "distances", "embeddings"],
      });
      console.log(`[VectorStore/Chroma] Search completed in ${Date.now() - startedAt}ms`);
      return result;
    } catch (err) {
      console.warn(`[VectorStore Warning] ChromaDB query failed (${err.message}). Querying in-memory store.`);
    }
  }

  // Query in-memory vector store with strict userId and noteIds filtering
  const targetUserId = userId ? String(userId) : null;
  const targetNoteIds = Array.isArray(noteIds) && noteIds.length ? noteIds.map((id) => String(id)) : null;

  const candidates = [];
  for (const item of inMemoryStore.values()) {
    if (targetUserId && item.metadata.userId !== targetUserId) continue;
    if (targetNoteIds && !targetNoteIds.includes(item.metadata.noteId)) continue;

    const similarity = cosineSimilarity(queryEmbedding, item.embedding);
    // Convert similarity to distance equivalent for format parity
    const distance = 1 - similarity;
    candidates.push({
      id: item.id,
      document: item.document,
      metadata: item.metadata,
      distance,
      embedding: item.embedding,
    });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  const selected = candidates.slice(0, topK);

  return {
    ids: [selected.map((c) => c.id)],
    documents: [selected.map((c) => c.document)],
    metadatas: [selected.map((c) => c.metadata)],
    distances: [selected.map((c) => c.distance)],
    embeddings: [selected.map((c) => c.embedding)],
  };
};

const getChunksByNoteId = async ({ noteId, userId }) => {
  const collection = await getCollection();

  if (collection) {
    try {
      return await collection.get({
        where: {
          noteId: String(noteId),
          ...(userId ? { userId: String(userId) } : {}),
        },
        include: ["documents", "metadatas"],
      });
    } catch (err) {
      console.warn(`[VectorStore Warning] ChromaDB get failed: ${err.message}`);
    }
  }

  const selected = [];
  for (const item of inMemoryStore.values()) {
    if (item.metadata.noteId === String(noteId)) {
      if (!userId || item.metadata.userId === String(userId)) {
        selected.push(item);
      }
    }
  }

  return {
    ids: selected.map((s) => s.id),
    documents: selected.map((s) => s.document),
    metadatas: selected.map((s) => s.metadata),
  };
};

const deleteChunksByNoteId = async ({ noteId, userId }) => {
  const collection = await getCollection();

  if (collection) {
    try {
      await collection.delete({
        where: {
          noteId: String(noteId),
          ...(userId ? { userId: String(userId) } : {}),
        },
      });
      console.log(`[VectorStore] Deleted ChromaDB chunks for noteId=${noteId}`);
    } catch (error) {
      console.warn(`[VectorStore Warning] Failed to delete ChromaDB chunks: ${error.message}`);
    }
  }

  // Delete from in-memory store
  for (const [id, item] of inMemoryStore.entries()) {
    if (item.metadata.noteId === String(noteId)) {
      if (!userId || item.metadata.userId === String(userId)) {
        inMemoryStore.delete(id);
      }
    }
  }
};

module.exports = {
  addChunksToDB,
  searchSimilarChunks,
  getChunksByNoteId,
  deleteChunksByNoteId,
  inMemoryStore,
};