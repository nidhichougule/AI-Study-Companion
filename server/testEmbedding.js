require("dotenv").config();

const { generateEmbedding } = require("./services/embeddingService");

(async () => {
  const embedding = await generateEmbedding("What is MongoDB?");
  console.log("Vector Length:", embedding.length);
})();