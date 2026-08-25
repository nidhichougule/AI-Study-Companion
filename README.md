# 🤖 AI Study Companion

> An AI-powered full-stack study assistant that lets students upload study materials, ask grounded questions, generate AI quizzes, and track their learning progress.

AI Study Companion is a full-stack web application designed to make studying more interactive and personalized. Students can upload PDF notes, ask questions based specifically on their uploaded study material, receive AI-generated answers with source references, create MCQ quizzes from their notes, and monitor their quiz performance through a progress dashboard.

---

## ✨ Features

### 🔐 Authentication & Security

- User registration and login
- JWT-based authentication
- Protected API routes
- User-specific documents, chats, quizzes, and progress
- Secure environment-variable based secrets
- Cross-user document and vector isolation
- Protected MongoDB queries

### 📚 PDF Study Material Management

- Upload PDF study materials
- Automatic PDF text extraction
- Intelligent text chunking
- Document processing status
- Page and chunk information
- Multiple document management
- Delete uploaded documents
- Vector cleanup when documents are deleted
- Persistent document chunks for recovery after server restart

### 🧠 AI-Powered RAG Chat

Ask questions about your uploaded study materials and receive answers grounded in those documents.

The RAG pipeline:

```text
PDF Upload
    ↓
PDF Text Extraction
    ↓
Text Chunking
    ↓
Hugging Face Embeddings
    ↓
Vector Storage
    ↓
Semantic Similarity Search
    ↓
Relevant Context Retrieval
    ↓
Groq LLM
    ↓
Grounded AI Answer
    ↓
Source References
