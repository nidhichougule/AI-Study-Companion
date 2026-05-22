# AI Study Companion

An AI-powered full-stack study assistant designed to help students learn smarter by interacting with their uploaded study materials.

The platform allows users to securely upload PDF notes, ask context-aware questions using an LLM, and generate quizzes from study content.

---

## Project Overview

AI Study Companion transforms static study notes into an interactive learning experience.

Instead of manually searching through notes, students can:

- Upload study PDFs
- Ask natural language questions
- Receive AI-generated contextual answers
- Generate quizzes for self-assessment
- Access a secure personalized study environment

This project demonstrates modern full-stack development combined with practical AI integration.

---

## Key Features

### Authentication & Security
- User Registration and Login
- JWT-based Authentication
- Protected Routes
- Password Hashing using bcrypt

### Study Material Management
- Upload PDF Notes
- PDF Text Extraction using pdf-parse
- Persistent storage of extracted notes in MongoDB

### AI-Powered Learning
- Context-aware question answering using Groq API + Llama 3
- AI answers generated from uploaded study material
- Natural language interaction with notes

### Quiz Generation
- Automatic quiz generation from uploaded study content
- Practice-based learning support

---

## System Architecture

```text
Frontend (React)
      ↓
Backend API (Express.js)
      ↓
Authentication Layer (JWT + bcrypt)
      ↓
MongoDB Atlas (Users + Notes Storage)
      ↓
PDF Processing (multer + pdf-parse)
      ↓
Groq LLM API (Llama 3)
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
- Mongoose ODM

### Authentication
- JSON Web Token (JWT)
- bcryptjs

### File Processing
- multer
- pdf-parse

### AI / LLM
- Groq API
- Llama 3.1 Model

### Version Control
- Git
- GitHub

---

## Folder Structure

```text
AI-Study-Companion/
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│
├── server/                     # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
│
├── README.md
└── .gitignore
```

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/nidhichougule/AI-Study-Companion.git
cd AI-Study-Companion
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create environment file:

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

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

Backend runs at:

```text
http://localhost:5000
```

---

## Example Use Case

1. User creates account
2. Logs into secure dashboard
3. Uploads study PDF
4. System extracts PDF content
5. User asks:

```text
Why is bcrypt used?
```

6. AI processes:

- Uploaded notes context
- User question
- LLM reasoning

7. Returns intelligent contextual answer

---

## Future Enhancements

- AI-generated MCQ quiz with options
- Quiz scoring and performance tracking
- Chat history
- Multi-document support
- User-specific note organization
- Semantic search / vector database integration
- Retrieval-Augmented Generation (RAG)
- Voice-based study assistant

---

## Learning Outcomes

This project demonstrates understanding of:

- Full-stack application development
- REST API design
- Authentication & authorization
- Secure password handling
- Database design with MongoDB
- File upload & parsing workflows
- LLM API integration
- AI-powered application architecture
- Client-server communication

---

## Author

**Nidhi Chougule**

Electronics & Computer Science Student  
Aspiring AI/ML Engineer | Full Stack Developer

GitHub: https://github.com/nidhichougule

---

## License

This project is developed for academic learning and portfolio demonstration.