const Chat = require("../models/Chat");
const Note = require("../models/Note");
const { retrieveRelevantChunks, buildRagPrompt } = require("../services/retrievalService");
const { generateAnswer } = require("../services/llmService");

const DEFAULT_CHAT_TITLE = "New Chat";

const normalizePdfIds = (pdfIds) => {
  if (!Array.isArray(pdfIds)) return [];
  return [...new Set(pdfIds.map((id) => String(id).trim()).filter(Boolean))];
};

const mergePdfIds = (...sets) => {
  return [...new Set(sets.flat().map((id) => String(id).trim()).filter(Boolean))];
};

/**
 * Filter provided pdfIds so that only those belonging to the authenticated user are preserved.
 */
const validateUserPdfIds = async (pdfIds, userId) => {
  const normalized = normalizePdfIds(pdfIds);
  if (!normalized.length || !userId) return [];
  try {
    const validNotes = await Note.find({
      _id: { $in: normalized },
      userId: String(userId),
    }).select("_id");
    const validSet = new Set(validNotes.map((n) => String(n._id)));
    return normalized.filter((id) => validSet.has(id));
  } catch (err) {
    console.warn("PDF validation warning:", err.message);
    return [];
  }
};

const listChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1, _id: -1 });
    res.json(chats);
  } catch (err) {
    console.error("Get chats failed:", err);
    res.status(500).json({ message: "Failed to load chat conversations." });
  }
};

const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid chat id" });
    }
    console.error("Get chat by id failed:", err);
    res.status(500).json({ message: "Failed to retrieve chat." });
  }
};

const createChat = async (req, res) => {
  try {
    const title = (req.body?.title || DEFAULT_CHAT_TITLE).trim();
    const validatedPdfIds = await validateUserPdfIds(req.body?.pdfIds, req.user.id);

    const chat = await Chat.create({
      userId: req.user.id,
      title: title || DEFAULT_CHAT_TITLE,
      pdfIds: validatedPdfIds,
      messages: [],
    });

    res.status(201).json({ chat });
  } catch (err) {
    console.error("Create chat failed:", err);
    res.status(500).json({ message: "Failed to create new chat." });
  }
};

const updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const updates = {};

    if (typeof req.body?.title === "string") {
      const title = req.body.title.trim();
      if (!title) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updates.title = title;
    }

    if (req.body?.pdfIds) {
      updates.pdfIds = await validateUserPdfIds(req.body.pdfIds, req.user.id);
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ chat });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid chat id" });
    }
    console.error("Update chat failed:", err);
    res.status(500).json({ message: "Failed to update chat." });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const result = await Chat.findOneAndDelete({
      _id: chatId,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(204).send();
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid chat id" });
    }
    console.error("Delete chat failed:", err);
    res.status(500).json({ message: "Failed to delete chat." });
  }
};

const askQuestionInternal = async ({ question, userId, chatId, pdfIds, strictChatId }) => {
  const normalizedQuestion = String(question || "").trim();
  if (!normalizedQuestion) {
    const validationError = new Error("Question is required");
    validationError.statusCode = 400;
    throw validationError;
  }

  let chat = null;
  if (chatId) {
    chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat && strictChatId) {
      const notFoundError = new Error("Chat not found");
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
  }

  // Determine effective PDF IDs (prefer explicit request pdfIds if provided, fallback to chat's saved pdfIds)
  const inputPdfIds = (Array.isArray(pdfIds) && pdfIds.length > 0)
    ? pdfIds
    : (chat?.pdfIds || []);
  const validatedPdfIds = await validateUserPdfIds(inputPdfIds, userId);

  const { retrievedChunks, sources, hasRelevantContext } = await retrieveRelevantChunks({
    question: normalizedQuestion,
    userId,
    topK: 5,
    noteIds: validatedPdfIds.length ? validatedPdfIds : undefined,
  });

  console.log(`[BrowserRAG] userId=${userId} requestedPdfIds=${JSON.stringify(pdfIds || [])} validatedNoteIds=${JSON.stringify(validatedPdfIds)} retrievedChunks=${retrievedChunks.length} hasRelevantContext=${hasRelevantContext}`);

  let answer = "";
  if (!hasRelevantContext || !retrievedChunks.length) {
    answer = "The requested information was not found in your uploaded study material.";
  } else {
    const prompt = buildRagPrompt({
      question: normalizedQuestion,
      retrievedChunks,
    });

    try {
      answer = await generateAnswer(prompt);
      if (!answer || !answer.trim()) {
        answer = "The requested information was not found in your uploaded study material.";
      }
    } catch (error) {
      console.error("Groq AI generation failed:", error.message);
      answer = "I could not generate an AI answer right now. Please try again in a few moments.";
    }
  }

  const sourcePdfIds = [...new Set(retrievedChunks.map((chunk) => chunk.metadata.noteId).filter(Boolean))];
  const messageTimestamp = new Date();

  if (!chat) {
    chat = await Chat.create({
      userId,
      title: normalizedQuestion.slice(0, 40) || DEFAULT_CHAT_TITLE,
      pdfIds: mergePdfIds(validatedPdfIds, sourcePdfIds),
      messages: [],
    });
  } else {
    chat.pdfIds = mergePdfIds(chat.pdfIds || [], validatedPdfIds, sourcePdfIds);
  }

  chat.messages.push(
    {
      role: "user",
      text: normalizedQuestion,
      timestamp: messageTimestamp,
      sourcePdfIds: validatedPdfIds,
    },
    {
      role: "ai",
      text: answer,
      timestamp: messageTimestamp,
      sourcePdfIds,
    }
  );
  await chat.save();

  return {
    answer,
    sources,
    retrievedChunks,
    chat,
  };
};

const askQuestion = async (req, res) => {
  try {
    const result = await askQuestionInternal({
      question: req.body?.question,
      chatId: req.body?.chatId,
      pdfIds: req.body?.pdfIds,
      userId: req.user.id,
      strictChatId: false,
    });

    return res.json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid chat id" });
    }
    console.error("Chat ask failed:", err);
    res.status(500).json({ message: "Failed to process chat question." });
  }
};

const continueConversation = async (req, res) => {
  try {
    const result = await askQuestionInternal({
      question: req.body?.question,
      chatId: req.params?.chatId,
      pdfIds: req.body?.pdfIds,
      userId: req.user.id,
      strictChatId: true,
    });

    return res.json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid chat id" });
    }
    console.error("Continue chat failed:", err);
    res.status(500).json({ message: "Failed to continue conversation." });
  }
};

module.exports = {
  askQuestion,
  continueConversation,
  listChats,
  getChats: listChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  validateUserPdfIds,
};