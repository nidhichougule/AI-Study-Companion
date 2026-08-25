const Groq = require("groq-sdk");
const { HfInference } = require("@huggingface/inference");

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
};

const getHfClient = () => {
  const token = process.env.HF_TOKEN || process.env.HF_API_KEY;
  return new HfInference(token);
};

/**
 * Generate AI completion using Groq Llama (or fallback to Hugging Face if unconfigured)
 * @param {string} prompt - RAG system/user prompt
 * @param {object} options - Generation options (systemMessage, temperature, maxTokens)
 * @returns {Promise<string>} Generated completion text
 */
const generateAnswer = async (prompt, options = {}) => {
  const startedAt = Date.now();
  const primaryModel = options.model || process.env.GROQ_MODEL || "groq/compound";
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens || 1024;
  const systemPrompt =
    options.systemPrompt || "You are an AI study companion. Answer accurately, strictly based on the provided material.";

  const groqClient = getGroqClient();

  // 1. Groq SDK path with model fallback chain
  if (groqClient) {
    const groqModels = [primaryModel, "groq/compound-mini"].filter((m, i, self) => self.indexOf(m) === i);
    for (const modelName of groqModels) {
      try {
        const completion = await groqClient.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          model: modelName,
          temperature,
          max_tokens: maxTokens,
        });

        const text = completion.choices[0]?.message?.content?.trim() || "";
        console.log(
          `[RAG/Groq] LLM response generated in ${Date.now() - startedAt}ms using model=${modelName} | outputChars=${text.length}`
        );
        return text;
      } catch (error) {
        console.warn(`[RAG/Groq Warning] Groq model "${modelName}" failed: ${error.message}`);
        if (error.status === 429 || String(error.message).includes("rate_limit")) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }
  }

  // 2. Hugging Face Fallback if Groq key missing or Groq rate limits exhausted
  const hfModels = ["Qwen/Qwen2.5-72B-Instruct", "HuggingFaceH4/zephyr-7b-beta"];
  for (const hfModel of hfModels) {
    try {
      const hf = getHfClient();
      const response = await hf.chatCompletion({
        model: hfModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const text = response.choices[0]?.message?.content?.trim() || "";
      if (text) {
        console.log(`[RAG/HF] Hugging Face response generated in ${Date.now() - startedAt}ms (model=${hfModel})`);
        return text;
      }
    } catch (hfError) {
      console.warn(`[RAG/HF Warning] Hugging Face chatCompletion with model="${hfModel}" failed: ${hfError.message}`);
    }
  }

  throw new Error("AI LLM service is temporarily unavailable. Please try again in a few moments.");
};

module.exports = { generateAnswer };