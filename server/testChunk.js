const { splitIntoChunks } = require("./services/chunkService");

(async () => {
  const text = `
  Chapter 1 Introduction to Operating Systems.

  Chapter 2 Process Management.

  Chapter 3 Memory Management.
  `;

  const chunks = await splitIntoChunks(text);

  console.log("Chunks:", chunks.length);
  console.log(chunks);
})();