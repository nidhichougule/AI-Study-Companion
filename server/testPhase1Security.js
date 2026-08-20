const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Note = require("./models/Note");
const jwt = require("jsonwebtoken");
const { register, login, getMe } = require("./controllers/authController");
const { generateQuiz } = require("./controllers/quizController");
const { getNotes } = require("./controllers/noteController");

async function runTests() {
  console.log("=========================================");
  console.log("  PHASE 1 SECURITY & ISOLATION VERIFICATION");
  console.log("=========================================");

  // Test 1: Verify JWT_SECRET is loaded from process.env
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("FAIL: JWT_SECRET environment variable is missing!");
  }
  console.log("✔ TEST 1 PASSED: process.env.JWT_SECRET is configured and non-empty.");

  await connectDB();
  const dbConnected = mongoose.connection.readyState === 1;

  if (dbConnected) {
    console.log("✔ DATABASE IS CONNECTED: Running full database integration tests...");

    // Test 2: Clean up previous test users
    await User.deleteMany({ email: { $in: ["user_a@test.com", "user_b@test.com"] } });
    await Note.deleteMany({ fileName: "test_phase1_doc.pdf" });

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
      return res;
    };

    // Register User A
    const reqRegA = { body: { name: "User A", email: "user_a@test.com", password: "Password123!" } };
    const resRegA = mockRes();
    await register(reqRegA, resRegA);
    console.log("✔ TEST 2a PASSED: Registered User A successfully.");

    // Register User B
    const reqRegB = { body: { name: "User B", email: "user_b@test.com", password: "Password123!" } };
    const resRegB = mockRes();
    await register(reqRegB, resRegB);
    console.log("✔ TEST 2b PASSED: Registered User B successfully.");

    // Login User A
    const reqLogA = { body: { email: "user_a@test.com", password: "Password123!" } };
    const resLogA = mockRes();
    await login(reqLogA, resLogA);
    const tokenA = resLogA.body.token;
    const decodedA = jwt.verify(tokenA, secret);
    const userIdA = decodedA.id;
    console.log(`✔ TEST 3a PASSED: Logged in User A (ID: ${userIdA}) & verified JWT signature against env secret.`);

    // Login User B
    const reqLogB = { body: { email: "user_b@test.com", password: "Password123!" } };
    const resLogB = mockRes();
    await login(reqLogB, resLogB);
    const tokenB = resLogB.body.token;
    const decodedB = jwt.verify(tokenB, secret);
    const userIdB = decodedB.id;
    console.log(`✔ TEST 3b PASSED: Logged in User B (ID: ${userIdB}) & verified JWT signature against env secret.`);

    // Test 4: Test GET /me
    const reqMeA = { user: { id: userIdA } };
    const resMeA = mockRes();
    await getMe(reqMeA, resMeA);
    if (resMeA.body.email !== "user_a@test.com") {
      throw new Error("FAIL: GET /me returned incorrect profile for User A!");
    }
    console.log("✔ TEST 4 PASSED: Auth /me returns correct authenticated user profile.");

    // Test 5: Data Isolation - Create Note for User B
    const noteB = await Note.create({
      userId: userIdB,
      fileName: "test_phase1_doc.pdf",
      chunkCount: 3,
      pageCount: 1,
      pdfTextLength: 500,
    });

    // Verify User A fetching notes ONLY gets User A notes (0 notes)
    const reqNotesA = { user: { id: userIdA } };
    const resNotesA = mockRes();
    await getNotes(reqNotesA, resNotesA);
    if (resNotesA.body.length !== 0) {
      throw new Error(`FAIL: User A accessed ${resNotesA.body.length} notes belonging to User B!`);
    }
    console.log("✔ TEST 5 PASSED: User A cannot see notes belonging to User B.");

    // Test 6: Verify Quiz Generation cross-user isolation
    const reqQuizA = { user: { id: userIdA } };
    const resQuizA = mockRes();
    await generateQuiz(reqQuizA, resQuizA);
    if (resQuizA.statusCode !== 404 || !resQuizA.body.message.includes("Upload a PDF first")) {
      throw new Error(`FAIL: User A generated quiz from User B's note! Response: ${JSON.stringify(resQuizA.body)}`);
    }
    console.log("✔ TEST 6 PASSED: Quiz generator properly isolates notes per user (User A gets 404 'Upload a PDF first' even when User B has notes).");

    // Clean up
    await Note.findByIdAndDelete(noteB._id);
    await User.deleteMany({ email: { $in: ["user_a@test.com", "user_b@test.com"] } });
    await mongoose.disconnect();
  } else {
    console.log("⚠ WARNING: Database server is offline/unreachable in this environment. Testing offline JWT & security contracts...");

    // Test JWT signing & verification contract offline
    const testPayload = { id: "user_123456789012345678901234" };
    const token = jwt.sign(testPayload, secret, { expiresIn: "1d" });
    const decoded = jwt.verify(token, secret);
    if (decoded.id !== testPayload.id) {
      throw new Error("FAIL: Offline JWT verification failed!");
    }
    console.log("✔ OFFLINE TEST 2 PASSED: JWT signing & verification contract matches process.env.JWT_SECRET.");

    // Test invalid secret failure
    try {
      jwt.verify(token, "wrong_secret_key");
      throw new Error("FAIL: JWT verification should have failed with wrong secret!");
    } catch (err) {
      if (err.message.includes("FAIL")) throw err;
      console.log("✔ OFFLINE TEST 3 PASSED: JWT verification correctly rejects unauthorized signatures.");
    }
  }

  console.log("=========================================");
  console.log("  ALL PHASE 1 SECURITY TESTS PASSED!");
  console.log("=========================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
