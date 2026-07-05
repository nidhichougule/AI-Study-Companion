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

// ---------------- CHAT ----------------

export const getChats = () => API.get("/chats");
export const getChatById = (chatId) => API.get(`/chats/${chatId}`);
export const createChat = (payload = {}) => API.post("/chat/create", payload);
export const askQuestion = (data, config = {}) => API.post("/chat/ask", data, config);
export const renameChat = (chatId, title) => API.patch(`/chat/${chatId}/rename`, { title });
export const deleteChat = (chatId) => API.delete(`/chat/${chatId}`);

// ---------------- PDF / NOTES ----------------

export const getNotes = () => API.get("/notes");
export const uploadPDF = (formData, onUploadProgress) =>
  API.post("/upload/pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

export default API;
