const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_TOKEN || process.env.HF_API_KEY);

const normalizeVector = (vector) => {
  const values = Array.isArray(vector) ? vector : Array.from(vector || []);
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) return values;
  return values.map((value) => value / magnitude);
};

async function generateEmbedding(text) {
  const startedAt = Date.now();
  const inputText = String(text || "").trim();
  if (!inputText) {
    throw new Error("Embedding input text is required");
  }

  const result = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: inputText,
  });

  const embedding = normalizeVector(result);
  const elapsedMs = Date.now() - startedAt;
  console.log(
    `[RAG] Embedding generated in ${elapsedMs}ms | chars=${inputText.length} | dimensions=${embedding.length}`
  );

  return embedding;
}

module.exports = { generateEmbedding };