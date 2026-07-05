const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_TOKEN || process.env.HF_API_KEY);

const generateAnswer = async (prompt) => {
  const startedAt = Date.now();
  const response = await hf.textGeneration({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    inputs: prompt,
    parameters: {
      max_new_tokens: 300,
      temperature: 0.7,
    },
  });

  const elapsedMs = Date.now() - startedAt;
  console.log(`[RAG] LLM response generated in ${elapsedMs}ms | promptChars=${String(prompt || "").length}`);

  return response.generated_text;
};

module.exports = { generateAnswer };