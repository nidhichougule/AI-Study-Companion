# AI Study Companion

An AI-powered full-stack web application that transforms traditional study notes into an interactive learning experience.

AI Study Companion enables students to securely upload PDF study materials, interact with their notes through natural language questioning, and generate quizzes for self-assessment using Large Language Models (LLMs).

---

## Overview

Traditional study materials are static and time-consuming to navigate. AI Study Companion addresses this by combining modern full-stack development with AI-powered contextual learning.

The platform allows users to:

- Securely create accounts and authenticate
- Upload study PDFs
- Extract and store note content
- Ask natural language questions about uploaded material
- Receive AI-generated contextual responses
- Generate quizzes for active learning and revision

This project demonstrates practical integration of web development, backend engineering, database management, and generative AI.

---

## Core Features

### Authentication & Security
- Secure user registration and login
- JWT-based authentication
- Protected frontend routes
- Password hashing using bcrypt

### Study Material Management
- PDF upload functionality
- Automated PDF text extraction
- Persistent note storage in MongoDB

### AI-Powered Learning Assistant
- Context-aware question answering using Groq API
- Llama 3 powered natural language responses
- AI-generated explanations based on uploaded study content

### Quiz Generation
- Automatic question extraction from uploaded notes
- Self-assessment support for revision and practice

---

## System Architecture

```text
React Frontend
      ↓
Express.js Backend API
      ↓
Authentication Layer (JWT + bcrypt)
      ↓
MongoDB Atlas Database
      ↓
PDF Upload & Text Extraction
      ↓
Groq API (Llama 3 LLM)
      ↓
AI-generated contextual responses
```

---

## Technology Stack

### Frontend
- React.js
- React Router DOM
- JavaScript (ES6+)
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication & Security
- JSON Web Token (JWT)
- bcryptjs

### File Handling
- multer
- pdf-parse

### AI / LLM Integration
- Groq API
- Llama 3.1

### Development Tools
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

## Installation & Setup

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

Run backend server:

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

1. User creates an account
2. Authenticates securely
3. Uploads a PDF study document
4. System extracts and stores note content
5. User asks a question in natural language
6. Uploaded note content is sent as context to the LLM
7. AI generates an intelligent contextual response
8. User generates quiz questions for revision

---

## Example AI Interaction

**Question:**

```text
Why is bcrypt used?
```

**AI Response:**

```text
bcrypt is used to securely hash passwords before storing them in the database. This improves security because even if the database is compromised, attackers cannot easily recover original passwords.
```

---

## Future Enhancements

- AI-generated MCQ quizzes with answer options
- Quiz scoring and progress tracking
- Chat history management
- Multi-document study support
- User-specific document organization
- Semantic search using vector databases
- Retrieval-Augmented Generation (RAG)
- Voice-enabled AI study assistant
- Performance analytics dashboard

---

## Learning Outcomes

This project demonstrates practical experience in:

- Full-stack web development
- REST API design
- Authentication and authorization
- Secure credential management
- MongoDB database integration
- File upload and PDF parsing workflows
- Third-party AI API integration
- LLM-powered application development
- Client-server architecture
- AI-assisted educational application design

---

## Author

**Nidhi Chougule**  
Electronics & Computer Science Student  
Aspiring AI/ML Engineer | Full Stack Developer

GitHub: https://github.com/nidhichougule

---

## License

This project is intended for academic learning, portfolio demonstration, and educational experimentation.