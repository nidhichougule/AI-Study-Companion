const { ChromaClient } = require("chromadb");

const client = new ChromaClient();

// 👇 THIS is where getCollection goes
const getCollection = async () => {
  return await client.getOrCreateCollection({
    name: "study_chunks",
  });
};

// STORE chunks
const addChunksToDB = async (chunks, embeddings, fileName) => {
  const collection = await getCollection();

  await collection.add({
    ids: chunks.map((_, i) => `${fileName}-chunk-${i}`),
    documents: chunks,
    embeddings: embeddings,
    metadatas: chunks.map((_, i) => ({
      fileName,
      chunkIndex: i,
    })),
  });
};

// SEARCH chunks (we will use next step)
const searchSimilarChunks = async (queryEmbedding, topK = 3) => {
  const collection = await getCollection();

  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  return result;
};

module.exports = {
  addChunksToDB,
  searchSimilarChunks,
};