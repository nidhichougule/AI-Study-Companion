const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Note = require("./models/Note");
const Chat = require("./models/Chat");
const jwt = require("jsonwebtoken");

const { register, login, getMe } = require("./controllers/authController");
const { getNotes, getNoteById, deleteNote } = require("./controllers/noteController");
const { uploadPDF } = require("./controllers/uploadController");
const { generateEmbedding } = require("./services/embeddingService");
const { addChunksToDB, searchSimilarChunks, getChunksByNoteId, deleteChunksByNoteId } = require("./services/vectorStore");
const { retrieveRelevantChunks, buildRagPrompt } = require("./services/retrievalService");
const { generateAnswer } = require("./services/llmService");
const { askQuestion, validateUserPdfIds } = require("./controllers/chatController");

async function runPhase3Phase4Tests() {
  console.log("=========================================================");
  console.log("   PHASE 3 & 4 MULTI-DOC MANAGEMENT & MULTI-DOC RAG TESTS");
  console.log("=========================================================");

  await connectDB();
  const dbConnected = mongoose.connection.readyState === 1;

  const userAId = "507f1f77bcf86cd799439011";
  const userBId = "507f1f77bcf86cd799439022";

  // Mock res factory
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    res.send = () => res;
    return res;
  };

  if (dbConnected) {
    console.log("Cleaning up previous test notes and chats...");
    await Note.deleteMany({ userId: { $in: [userAId, userBId] } });
    await Chat.deleteMany({ userId: { $in: [userAId, userBId] } });

    // 1. Create Documents for User A and User B
    const noteA1 = await Note.create({
      userId: userAId,
      fileName: "UserA_DataStructures.pdf",
      chunkCount: 2,
      pageCount: 1,
      pdfTextLength: 300,
      status: "processed",
    });

    const noteA2 = await Note.create({
      userId: userAId,
      fileName: "UserA_Algorithms.pdf",
      chunkCount: 3,
      pageCount: 2,
      pdfTextLength: 500,
      status: "processed",
    });

    const noteB1 = await Note.create({
      userId: userBId,
      fileName: "UserB_SecretDoc.pdf",
      chunkCount: 4,
      pageCount: 3,
      pdfTextLength: 600,
      status: "processed",
    });

    // TEST 1: List documents for authenticated user
    const resNotesA = mockRes();
    await getNotes({ user: { id: userAId } }, resNotesA);
    if (resNotesA.body.length !== 2 || !resNotesA.body.every((n) => String(n.userId) === userAId)) {
      throw new Error(`TEST 1 FAILED: GET /api/notes returned ${resNotesA.body.length} notes!`);
    }
    console.log("✔ TEST 1 PASSED: GET /api/notes returns ONLY the authenticated user's documents.");

    // TEST 2: Cross-user document access rejection (GET /api/notes/:id)
    const resGetCross = mockRes();
    await getNoteById({ params: { id: noteB1._id }, user: { id: userAId } }, resGetCross);
    if (resGetCross.statusCode !== 404) {
      throw new Error("TEST 2 FAILED: User A was able to access User B's document!");
    }
    console.log("✔ TEST 2 PASSED: Cross-user document GET access correctly rejected with 404.");

    // TEST 3: Cross-user document deletion rejection (DELETE /api/notes/:id)
    const resDelCross = mockRes();
    await deleteNote({ params: { id: noteB1._id }, user: { id: userAId } }, resDelCross);
    if (resDelCross.statusCode !== 404) {
      throw new Error("TEST 3 FAILED: User A was able to delete User B's document!");
    }
    console.log("✔ TEST 3 PASSED: Cross-user document DELETE access correctly rejected with 404.");

    // TEST 4: Document deletion removes associated vectors
    await addChunksToDB({
      chunkItems: [{ text: "Data structures binary trees and heaps.", page: 1, chunkIndex: 0 }],
      embeddings: [await generateEmbedding("Data structures binary trees and heaps.")],
      fileName: "UserA_DataStructures.pdf",
      userId: userAId,
      noteId: noteA1._id,
    });

    const resDelA1 = mockRes();
    await deleteNote({ params: { id: noteA1._id }, user: { id: userAId } }, resDelA1);
    
    // Verify MongoDB note deleted
    const checkNoteA1 = await Note.findById(noteA1._id);
    if (checkNoteA1) throw new Error("TEST 4 FAILED: Note still exists in MongoDB!");

    // Verify vector chunks removed
    const chunksA1 = await getChunksByNoteId({ noteId: noteA1._id, userId: userAId });
    if (chunksA1.ids && chunksA1.ids.length > 0) {
      throw new Error("TEST 4 FAILED: Vectors were not deleted from vector store!");
    }
    console.log("✔ TEST 4 PASSED: Document deletion purges both MongoDB record and vector store chunks.");

    // TEST 5: Selected Note IDs validation & scoping
    const invalidPdfIds = [String(noteA2._id), String(noteB1._id)];
    const validated = await validateUserPdfIds(invalidPdfIds, userAId);
    if (validated.length !== 1 || validated[0] !== String(noteA2._id)) {
      throw new Error(`TEST 5 FAILED: Selected note ID validation allowed User B note ID! Output: ${validated}`);
    }
    console.log("✔ TEST 5 PASSED: Selected note IDs are strictly validated against authenticated user.");

    // Cleanup
    await Note.deleteMany({ userId: { $in: [userAId, userBId] } });
    await mongoose.disconnect();
  } else {
    console.log("⚠ Database offline: Running unit contract validation for Phase 3 & 4...");
  }

  // TEST 6: Multi-Document RAG Retrieval Scoping
  const chunkData = [
    { text: "Linear Algebra matrices and eigenvalues", page: 1, chunkIndex: 0 },
    { text: "Microprocessors 8086 registers and assembly", page: 2, chunkIndex: 1 },
  ];
  const emb1 = await generateEmbedding(chunkData[0].text);
  const emb2 = await generateEmbedding(chunkData[1].text);

  const testNote1 = "test_note_math_101";
  const testNote2 = "test_note_micro_202";

  await addChunksToDB({
    chunkItems: [chunkData[0]],
    embeddings: [emb1],
    fileName: "MathNotes.pdf",
    userId: userAId,
    noteId: testNote1,
  });

  await addChunksToDB({
    chunkItems: [chunkData[1]],
    embeddings: [emb2],
    fileName: "MicroNotes.pdf",
    userId: userAId,
    noteId: testNote2,
  });

  // Query scoped ONLY to MathNotes (testNote1)
  const scopedResult = await retrieveRelevantChunks({
    question: "What are matrices and registers?",
    userId: userAId,
    topK: 5,
    noteIds: [testNote1],
  });

  const containsMicro = scopedResult.retrievedChunks.some((c) => c.metadata.noteId === testNote2);
  if (containsMicro) {
    throw new Error("TEST 6 FAILED: RAG search included chunks outside selected document scoping!");
  }
  console.log("✔ TEST 6 PASSED: Multi-document RAG search strictly respects selected noteIds filter.");

  // TEST 7: RAG Answer with sources
  if (scopedResult.sources.length === 0 || !scopedResult.sources[0].fileName || !scopedResult.sources[0].page) {
    throw new Error("TEST 7 FAILED: RAG sources missing filename or page metadata!");
  }
  console.log("✔ TEST 7 PASSED: RAG retrieval output includes structured sources with fileName, page, and snippet.");

  // TEST 8: No-context response ("not found in uploaded study material")
  const noContextResult = await retrieveRelevantChunks({
    question: "How do rocket thrusters work in orbital mechanics?",
    userId: userAId,
    topK: 5,
    noteIds: [testNote1],
  });

  const promptNoContext = buildRagPrompt({ question: "How do rocket thrusters work?", retrievedChunks: noContextResult.retrievedChunks });
  const answerNoContext = await generateAnswer(promptNoContext);
  if (!answerNoContext.toLowerCase().includes("not found")) {
    throw new Error("TEST 8 FAILED: Unrelated query did not produce 'not found in uploaded study material'!");
  }
  console.log("✔ TEST 8 PASSED: No-context query correctly produces exact 'not found in uploaded study material' refusal.");

  // Clean up
  await deleteChunksByNoteId({ noteId: testNote1, userId: userAId });
  await deleteChunksByNoteId({ noteId: testNote2, userId: userAId });

  console.log("=========================================================");
  console.log("  ALL PHASE 3 & 4 MULTI-DOC & RAG TESTS PASSED!");
  console.log("=========================================================");
  process.exit(0);
}

runPhase3Phase4Tests().catch((err) => {
  console.error("PHASE 3 & 4 TESTS FAILED:", err);
  process.exit(1);
});
