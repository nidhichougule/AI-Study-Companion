const mongoose = require("mongoose");

const categorizeMongoError = (err) => {
  const msg = String(err.message || "");
  const code = err.code;

  if (msg.includes("querySrv ENOTFOUND") || msg.includes("ENOTFOUND") || code === "ENOTFOUND") {
    return {
      type: "DNS / SRV Resolution Failure",
      details: "The MongoDB Atlas hostname in MONGO_URI could not be resolved by DNS.",
      action: "Please verify your MongoDB Atlas cluster hostname or obtain a fresh connection string from MongoDB Atlas.",
    };
  }

  if (msg.includes("Authentication failed") || msg.includes("auth failed") || err.code === 18) {
    return {
      type: "Authentication Failure",
      details: "MongoDB database credentials (username/password) were rejected.",
      action: "Please check your database username and password in server/.env.",
    };
  }

  if (msg.includes("MongoServerSelectionError") || msg.includes("connect ETIMEDOUT") || msg.includes("selection timed out")) {
    return {
      type: "Network / IP Whitelist Failure",
      details: "Could not establish network connection to MongoDB Atlas cluster within timeout.",
      action: "Ensure your current IP address is whitelisted in MongoDB Atlas under Network Access (e.g. 0.0.0.0/0 for dev).",
    };
  }

  if (msg.includes("Invalid connection string") || msg.includes("scheme")) {
    return {
      type: "Invalid MONGO_URI Format",
      details: "The connection string in server/.env has an invalid format.",
      action: "Please ensure MONGO_URI starts with 'mongodb+srv://' or 'mongodb://'.",
    };
  }

  return {
    type: "Cluster Unavailable",
    details: msg,
    action: "Please check your MongoDB Atlas cluster status.",
  };
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;

  if (!primaryUri) {
    console.error("❌ ERROR: MONGO_URI environment variable is not configured in server/.env.");
    return false;
  }

  try {
    // Attempt primary connection (MongoDB Atlas)
    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
    const hostDisplay = primaryUri.includes("@") ? primaryUri.split("@")[1].split("/")[0] : "primary database";
    console.log(`✅ MongoDB Connected successfully to: ${hostDisplay}`);
    return true;
  } catch (err) {
    const diag = categorizeMongoError(err);
    console.error(`\n❌ Primary MongoDB Connection Failed: [${diag.type}]`);
    console.error(`   Details: ${diag.details}`);
    console.error(`   Action Required: ${diag.action}\n`);

    // Optional local MongoDB fallback if explicitly enabled
    const allowLocalFallback = process.env.ALLOW_LOCAL_MONGO_FALLBACK === "true";
    const localUri = process.env.LOCAL_MONGO_URI || (allowLocalFallback ? "mongodb://127.0.0.1:27017/AIStudyCompanion" : null);

    if (localUri) {
      console.log(`Attempting connection to local MongoDB fallback (${localUri})...`);
      try {
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
        console.log("✅ Connected to fallback local MongoDB.");
        return true;
      } catch (fallbackErr) {
        console.error(`❌ Local fallback MongoDB connection failed: ${fallbackErr.message}`);
      }
    }

    // In-Memory MongoDB fallback only when explicitly enabled or running test suite
    const allowInMemory = process.env.ALLOW_IN_MEMORY_FALLBACK === "true" || process.env.NODE_ENV === "test";

    if (allowInMemory) {
      try {
        console.log("⚡ Starting Explicit In-Memory MongoDB Fallback Instance...");
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create({
          binary: { version: "6.0.6" }
        });
        const memUri = mongoServer.getUri();
        await mongoose.connect(memUri);
        console.log("✅ Connected to In-Memory MongoDB Fallback Instance.");
        return true;
      } catch (memErr) {
        console.error(`❌ In-Memory MongoDB fallback failed: ${memErr.message}`);
      }
    } else {
      console.log("💡 In-Memory Fallback is disabled for normal development. Set ALLOW_IN_MEMORY_FALLBACK=true in server/.env or whitelist your IP address in MongoDB Atlas.");
    }

    return false;
  }
};

module.exports = connectDB;