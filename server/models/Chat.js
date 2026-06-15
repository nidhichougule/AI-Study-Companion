const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    default: "New Chat",
  },

  messages: [
    {
      role: String, // user | ai
      text: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);