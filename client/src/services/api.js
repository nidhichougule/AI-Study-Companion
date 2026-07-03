import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- CHAT ----------------

export const getChats = () => API.get("/chats");

export const createChat = () => API.post("/chat/create");

export const askQuestion = (data) =>
  API.post("/chat/ask", data);

// ---------------- PDF ----------------

export const uploadPDF = (formData) =>
  API.post("/upload/pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getNotes = () => API.get("/notes");

export default API;