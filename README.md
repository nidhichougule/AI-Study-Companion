# AI Study Companion

AI Study Companion is a full-stack web application that allows users to upload PDF study materials, ask natural language questions based on uploaded content, and generate practice quiz questions.

The application combines modern web development with Large Language Model (LLM) integration to create an interactive study assistant.

---

## Overview

Traditional study notes are static and require manual searching. AI Study Companion improves this experience by allowing users to interact with uploaded study material through natural language questioning.

Users can:

- Create accounts and log in
- Upload PDF study notes
- Extract and store PDF content
- Ask questions about uploaded notes
- Receive AI-generated contextual answers
- Generate practice quiz questions

This project demonstrates full-stack development, backend API design, database integration, file processing, authentication, and LLM integration.

---

## Features

### Authentication
- User registration
- User login
- JWT-based authentication
- Protected frontend routes
- Password hashing using bcrypt

### PDF Study Material Processing
- PDF file upload
- Text extraction using pdf-parse
- Storage of extracted note content in MongoDB

### AI Question Answering
- Natural language question answering
- Groq API integration
- Llama 3 model usage
- AI-generated responses using uploaded PDF content as context

### Quiz Generation
- Automatic extraction of practice questions from uploaded study notes

---

## System Architecture

```text
React Frontend
      ↓
Express.js Backend API
      ↓
JWT Authentication Layer
      ↓
MongoDB Atlas Database
      ↓
PDF Upload + Text Extraction
      ↓
Groq API (Llama 3)
      ↓
AI-generated question answering
```

---

## Technology Stack

### Frontend
- React.js
- React Router DOM
- JavaScript
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcryptjs

### File Handling
- multer
- pdf-parse

### AI Integration
- Groq API
- Llama 3.1

### Version Control
- Git
- GitHub

---

## Project Structure

```text
AI-Study-Companion/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── README.md
└── .gitignore
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/nidhichougule/AI-Study-Companion.git
cd AI-Study-Companion
```

---

### Backend Setup

Install dependencies:

```bash
cd server
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
```

Run backend:

```bash
node server.js
```

---

### Frontend Setup

Install dependencies:

```bash
cd client
npm install
npm run dev
```

---

## Example Workflow

1. User registers and logs in
2. User uploads a PDF study document
3. Backend extracts text content from the PDF
4. Extracted text is stored in MongoDB
5. User asks a question in natural language
6. Uploaded note content is sent as context to Groq Llama 3
7. AI generates a contextual response
8. User can generate practice quiz questions

---

## Example Question

**User Input**

```text
Why is bcrypt used?
```

**AI Response**

```text
bcrypt is used to hash passwords securely before storing them in the database, reducing the risk of exposing original passwords if database data is compromised.
```

---

## Current Limitations

- AI currently uses the uploaded note content directly as context instead of semantic retrieval
- Quiz generation is based on question extraction from uploaded content
- Multi-document note management is not yet implemented
- User-specific note isolation can be improved further

---

## Future Improvements

- AI-generated MCQ quizzes with answer options
- Quiz scoring and progress tracking
- Multi-document support
- Chat history
- User-specific note organization
- Semantic retrieval / RAG implementation
- Voice interaction support

---

## Learning Outcomes

This project demonstrates practical experience in:

- Full-stack web development
- REST API development
- Authentication and authorization
- Secure password management
- MongoDB database integration
- File upload and PDF parsing
- LLM API integration
- AI-assisted application development
- Client-server communication

---

## Author

**Nidhi Chougule**  
Electronics & Computer Science Student  
Aspiring AI/ML Engineer | Full Stack Developer

GitHub: https://github.com/nidhichougule

---

## License

This project is intended for academic learning.