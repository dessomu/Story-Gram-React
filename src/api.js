import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3009", // your backend URL
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
