const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_TOKEN);

// 🧠 Generate answer using Llama / Mistral / free model
const generateAnswer = async (question, context) => {
  const prompt = `
You are an AI study assistant.

Use the context below to answer the question.

Context:
${context}

Question:
${question}

Answer in simple words:
`;

  const response = await hf.textGeneration({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    inputs: prompt,
    parameters: {
      max_new_tokens: 300,
      temperature: 0.7,
    },
  });

  return response.generated_text;
};

module.exports = { generateAnswer };