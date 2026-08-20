const Groq = require("groq-sdk");
const { HfInference } = require("@huggingface/inference");

const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
const hfClient = new HfInference(process.env.HF_TOKEN || process.env.HF_API_KEY);

const DEFAULT_MODEL = process.env.GROQ_MODEL || "groq/compound";

/**
 * Generate AI completion using Groq Llama (or fallback to Hugging Face if unconfigured)
 * @param {string} prompt - RAG system/user prompt
 * @param {object} options - Generation options (systemMessage, temperature, maxTokens)
 * @returns {Promise<string>} Generated completion text
 */
const generateAnswer = async (prompt, options = {}) => {
  const startedAt = Date.now();
  const modelName = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens || 1024;
  const systemPrompt = options.systemPrompt || "You are an AI study companion. Answer accurately, strictly based on the provided material.";

  // Primary path: Official Groq SDK
  if (groqClient) {
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
      const elapsedMs = Date.now() - startedAt;
      console.log(`[RAG/Groq] LLM response generated in ${elapsedMs}ms using model=${modelName} | outputChars=${text.length}`);
      return text;
    } catch (error) {
      console.error(`[RAG/Groq Error] Groq API call failed (${error.message}). Attempting fallback model...`);
      
      // Secondary Groq model fallback if primary model hits rate limit or error
      if (modelName !== "groq/compound-mini") {
        try {
          const fallbackCompletion = await groqClient.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            model: "groq/compound-mini",
            temperature,
            max_tokens: maxTokens,
          });
          const text = fallbackCompletion.choices[0]?.message?.content?.trim() || "";
          console.log(`[RAG/Groq] Fallback groq/compound-mini response generated in ${Date.now() - startedAt}ms`);
          return text;
        } catch (fallbackError) {
          console.error(`[RAG/Groq Error] Groq fallback failed (${fallbackError.message})`);
        }
      }
    }
  }

  // Hugging Face Fallback if Groq key missing or completely unreachable
  try {
    const response = await hfClient.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      inputs: `${systemPrompt}\n\n${prompt}`,
      parameters: {
        max_new_tokens: maxTokens,
        temperature,
      },
    });

    const text = response.generated_text || "";
    console.log(`[RAG/HF] Hugging Face fallback response generated in ${Date.now() - startedAt}ms`);
    return text;
  } catch (hfError) {
    console.error(`[RAG/HF Error] HuggingFace generation failed: ${hfError.message}`);
    throw new Error("AI LLM service is temporarily unavailable. Please try again in a few moments.");
  }
};

module.exports = { generateAnswer };