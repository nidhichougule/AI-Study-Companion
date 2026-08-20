const { HfInference } = require("@huggingface/inference");

const hfToken = process.env.HF_TOKEN || process.env.HF_API_KEY;
const hf = new HfInference(hfToken);

const VECTOR_DIMENSION = 384;

const normalizeVector = (vector) => {
  const values = Array.isArray(vector) ? vector : Array.from(vector || []);
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) return values;
  return values.map((value) => value / magnitude);
};

/**
 * Deterministic fallback vector generator (used ONLY in explicit offline test environments)
 */
const generateFallbackVector = (text) => {
  const vector = new Array(VECTOR_DIMENSION).fill(0);
  const normalized = String(text || "").toLowerCase().trim();
  
  if (!normalized) return vector;

  const words = normalized.split(/\s+/);
  for (let wIndex = 0; wIndex < words.length; wIndex += 1) {
    const word = words[wIndex];
    for (let charIndex = 0; charIndex < word.length; charIndex += 1) {
      const charCode = word.charCodeAt(charIndex);
      const dimIndex = (charCode * 31 + charIndex * 7 + wIndex * 13) % VECTOR_DIMENSION;
      vector[dimIndex] += 1.0 / (charIndex + 1);
    }
  }

  return normalizeVector(vector);
};

/**
 * Generate 384-dimensional vector embedding for text using sentence-transformers/all-MiniLM-L6-v2
 * @param {string} text 
 * @returns {Promise<number[]>} 384-dimensional normalized float array
 */
async function generateEmbedding(text) {
  const startedAt = Date.now();
  const inputText = String(text || "").trim();
  if (!inputText) {
    throw new Error("Embedding input text is required");
  }

  try {
    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: inputText,
    });

    const embedding = normalizeVector(result);
    if (Array.isArray(embedding) && embedding.length > 0) {
      console.log(`[RAG/Embedding/RealProvider] HuggingFace all-MiniLM-L6-v2 embedding generated in ${Date.now() - startedAt}ms | dim=${embedding.length}`);
      return embedding;
    }
    throw new Error("Empty embedding returned from feature extraction provider");
  } catch (error) {
    // Only use offline fallback if explicitly requested in test mode (e.g. offline CI environments)
    if (process.env.TEST_OFFLINE === "true") {
      console.warn(`[RAG/Embedding Warning] Test offline mode active. Using fallback vector.`);
      return generateFallbackVector(inputText);
    }
    console.error(`[RAG/Embedding Error] Real embedding provider failed: ${error.message}`);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

module.exports = { generateEmbedding, normalizeVector, generateFallbackVector };