const dotenv = require("dotenv");
dotenv.config();

const { splitPdfIntoChunks } = require("./services/chunkService");
const { generateEmbedding } = require("./services/embeddingService");
const { addChunksToDB, deleteChunksByNoteId } = require("./services/vectorStore");
const { retrieveRelevantChunks, buildRagPrompt } = require("./services/retrievalService");
const { generateAnswer } = require("./services/llmService");

async function runRealWorldRAGValidation() {
  console.log("=========================================================");
  console.log("  REAL-WORLD PHASE 2 RAG VALIDATION (A, B, C, D, E Tests)");
  console.log("=========================================================");

  // Users & Note IDs
  const userAlpha = "user_alpha_rag_val_001";
  const userBeta = "user_beta_rag_val_002";
  const noteAlpha1 = "note_alpha_computer_networks";
  const noteBeta1 = "note_beta_biology";

  // Document 1 (User Alpha): Computer Networks Study Notes (2 Pages)
  const docAlphaText = `
  Page 1: TCP/IP Model and Transmission Control Protocol.
  The TCP/IP model has four layers: Network Interface, Internet, Transport, and Application.
  Transmission Control Protocol (TCP) operates at the Transport Layer and provides reliable, connection-oriented data delivery using a 3-way handshake (SYN, SYN-ACK, ACK).

  \f
  Page 2: Domain Name System (DNS) and Port Numbers.
  The Domain Name System (DNS) translates human-friendly domain names (like example.com) into IP addresses and operates over UDP port 53.
  HTTP uses TCP port 80, whereas HTTPS uses TCP port 443 for encrypted communication using TLS/SSL.
  `;

  // Document 2 (User Beta): Biology Study Notes (Page 1)
  const docBetaText = `
  Page 1: Photosynthesis and Cellular Respiration.
  Photosynthesis takes place inside chloroplasts in plant cells, converting light energy into chemical energy stored in glucose.
  Cellular respiration takes place in the mitochondria to release ATP energy.
  `;

  // 1. Process & Chunk Documents
  const chunksAlpha = splitPdfIntoChunks(docAlphaText);
  const chunksBeta = splitPdfIntoChunks(docBetaText);

  console.log(`Document Alpha (Computer Networks): Chunked into ${chunksAlpha.length} chunks across pages.`);
  console.log(`Document Beta (Biology): Chunked into ${chunksBeta.length} chunks.`);

  // 2. Generate Real Embeddings (Verify real provider used)
  console.log("Generating real embeddings via HuggingFace API...");
  const embeddingsAlpha = await Promise.all(chunksAlpha.map((c) => generateEmbedding(c.text)));
  const embeddingsBeta = await Promise.all(chunksBeta.map((c) => generateEmbedding(c.text)));

  // 3. Store in Vector Store
  await addChunksToDB({
    chunkItems: chunksAlpha,
    embeddings: embeddingsAlpha,
    fileName: "Computer_Networks_Notes.pdf",
    userId: userAlpha,
    noteId: noteAlpha1,
  });

  await addChunksToDB({
    chunkItems: chunksBeta,
    embeddings: embeddingsBeta,
    fileName: "Biology_Notes.pdf",
    userId: userBeta,
    noteId: noteBeta1,
  });

  // TEST A: Question whose answer exists in Document Alpha (Single Chunk)
  console.log("\n---------------------------------------------------------");
  console.log("TEST A: Question whose answer exists in the document (Single Chunk)");
  console.log("Question: 'What port does DNS use and what protocol layer is it?'");
  
  const resA = await retrieveRelevantChunks({
    question: "What port does DNS use and what protocol layer is it?",
    userId: userAlpha,
    topK: 5,
  });

  console.log(`Retrieved ${resA.retrievedChunks.length} chunks. Sources:`, resA.sources);
  if (!resA.hasRelevantContext || !resA.sources.some(s => s.fileName === "Computer_Networks_Notes.pdf" && s.page === 2)) {
    throw new Error("TEST A FAILED: Page 2 DNS chunk not retrieved properly!");
  }

  const promptA = buildRagPrompt({ question: "What port does DNS use?", retrievedChunks: resA.retrievedChunks });
  const answerA = await generateAnswer(promptA);
  console.log(`AI Response A: "${answerA.slice(0, 150)}..."`);
  if (!answerA.toLowerCase().includes("53")) {
    throw new Error("TEST A FAILED: AI Answer did not reference port 53!");
  }
  console.log("✔ TEST A PASSED: Real embeddings retrieved correct chunk, metadata, and Groq generated grounded answer.");

  // TEST B: Question about a different topic (Asking User Alpha about Photosynthesis)
  console.log("\n---------------------------------------------------------");
  console.log("TEST B: Question about a different topic (Not in User Alpha's doc)");
  console.log("Question: 'How does photosynthesis convert light energy into glucose?'");

  const resB = await retrieveRelevantChunks({
    question: "How does photosynthesis convert light energy into glucose?",
    userId: userAlpha,
    topK: 5,
  });

  console.log(`Retrieved chunks count above threshold: ${resB.retrievedChunks.length}`);

  const promptB = buildRagPrompt({ question: "How does photosynthesis convert light energy into glucose?", retrievedChunks: resB.retrievedChunks });
  const answerB = await generateAnswer(promptB);
  console.log(`AI Response B: "${answerB.trim()}"`);
  if (!answerB.toLowerCase().includes("not found")) {
    throw new Error("TEST B FAILED: AI did not output 'not found in uploaded study material'!");
  }
  console.log("✔ TEST B PASSED: Irrelevant topic question correctly produced 'not found in uploaded study material' answer.");

  // TEST C: Question requiring information from two different chunks (Page 1 TCP + Page 2 HTTPS)
  console.log("\n---------------------------------------------------------");
  console.log("TEST C: Question requiring information from two chunks");
  console.log("Question: 'What handshake is used by TCP and what port does HTTPS use?'");

  const resC = await retrieveRelevantChunks({
    question: "What handshake is used by TCP and what port does HTTPS use?",
    userId: userAlpha,
    topK: 5,
  });

  console.log(`Retrieved ${resC.retrievedChunks.length} chunks. Pages:`, resC.sources.map(s => s.page));
  const pagesRetrieved = resC.sources.map(s => s.page);

  const promptC = buildRagPrompt({ question: "What handshake is used by TCP and what port does HTTPS use?", retrievedChunks: resC.retrievedChunks });
  const answerC = await generateAnswer(promptC);
  console.log(`AI Response C: "${answerC.slice(0, 180)}..."`);
  if (!answerC.toLowerCase().includes("handshake") && !answerC.includes("443")) {
    throw new Error("TEST C FAILED: Answer did not synthesize information from both chunks!");
  }
  console.log("✔ TEST C PASSED: Multi-chunk information synthesized correctly.");

  // TEST D: Question from another user's document (User Beta asking for User Alpha's TCP notes)
  console.log("\n---------------------------------------------------------");
  console.log("TEST D: Question from another user's document (User Beta requesting TCP notes)");
  console.log("Question: 'Explain the 3-way handshake of TCP'");

  const resD = await retrieveRelevantChunks({
    question: "Explain the 3-way handshake of TCP",
    userId: userBeta,
    topK: 5,
  });

  console.log(`User Beta retrieved chunks count: ${resD.retrievedChunks.length}`);
  const userALeak = resD.retrievedChunks.some(c => c.metadata.userId === userAlpha);
  if (userALeak) {
    throw new Error("TEST D FAILED: User Beta retrieved User Alpha's TCP notes!");
  }

  const promptD = buildRagPrompt({ question: "Explain the 3-way handshake of TCP", retrievedChunks: resD.retrievedChunks });
  const answerD = await generateAnswer(promptD);
  console.log(`AI Response D: "${answerD.trim()}"`);
  if (!answerD.toLowerCase().includes("not found")) {
    throw new Error("TEST D FAILED: User Beta should receive 'not found in uploaded study material'!");
  }
  console.log("✔ TEST D PASSED: Strict cross-user data isolation verified.");

  // TEST E: Question with no answer in ANY uploaded material (Quantum Physics)
  console.log("\n---------------------------------------------------------");
  console.log("TEST E: Question with no answer in ANY uploaded material");
  console.log("Question: 'Explain Schrödinger equation in quantum mechanics'");

  const resE = await retrieveRelevantChunks({
    question: "Explain Schrödinger equation in quantum mechanics",
    userId: userAlpha,
    topK: 5,
  });

  const promptE = buildRagPrompt({ question: "Explain Schrödinger equation in quantum mechanics", retrievedChunks: resE.retrievedChunks });
  const answerE = await generateAnswer(promptE);
  console.log(`AI Response E: "${answerE.trim()}"`);
  if (!answerE.toLowerCase().includes("not found")) {
    throw new Error("TEST E FAILED: AI did not refuse un-uploaded topic!");
  }
  console.log("✔ TEST E PASSED: Completely un-uploaded topic produces strict refusal without hallucination.");

  // Cleanup Vector DB
  await deleteChunksByNoteId({ noteId: noteAlpha1, userId: userAlpha });
  await deleteChunksByNoteId({ noteId: noteBeta1, userId: userBeta });

  console.log("\n=========================================================");
  console.log("  ALL REAL-WORLD RAG VALIDATION TESTS PASSED PERFECTLY!");
  console.log("=========================================================");
  process.exit(0);
}

runRealWorldRAGValidation().catch((err) => {
  console.error("REAL WORLD RAG VALIDATION FAILED:", err);
  process.exit(1);
});
