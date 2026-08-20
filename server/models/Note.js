const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fileName: {
      type: String,
      required: true,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    pdfTextLength: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["processing", "processed", "failed"],
      default: "processed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);