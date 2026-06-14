const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    userId: String,
    fileName: String,
    chunkIndex: Number,
    content: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chunk", chunkSchema);