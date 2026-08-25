import axios from "axios";

export const DATA_CHANGED_EVENT = "studyai:data-changed";

export const notifyDataChanged = () => {
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
};

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- AUTH ----------------
export const loginUser = (credentials) => API.post("/auth/login", credentials);
export const registerUser = (userData) => API.post("/auth/register", userData);
export const getMe = () => API.get("/auth/me");

// ---------------- CHAT ----------------

export const getChats = () => API.get("/chats");
export const getChatById = (chatId) => API.get(`/chats/${chatId}`);
export const createChat = (payload = {}) => API.post("/chat/create", payload);
export const askQuestion = (data, config = {}) => API.post("/chat/ask", data, config);
export const renameChat = (chatId, title) => API.patch(`/chat/${chatId}/rename`, { title });
export const deleteChat = (chatId) => API.delete(`/chat/${chatId}`);

// ---------------- PDF / NOTES ----------------

export const getNotes = () => API.get("/notes");
export const deleteNote = (id) => API.delete(`/notes/${id}`);
export const uploadPDF = (formData, onUploadProgress) =>
  API.post("/upload/pdf", formData, {
    onUploadProgress,
  });

// ---------------- QUIZ ----------------
export const generateQuiz = (params = {}) => API.post("/quiz/generate", params);
export const getQuizzes = () => API.get("/quiz");
export const getQuizById = (quizId) => API.get(`/quiz/${quizId}`);
export const submitQuizAttempt = (quizId, answers) => API.post(`/quiz/${quizId}/attempt`, { answers });
export const getQuizAttempts = (quizId) => API.get(`/quiz/${quizId}/attempts`);

// ---------------- PROGRESS ----------------
export const getUserProgress = () => API.get("/progress");

export default API;
