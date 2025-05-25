import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1", // .env.localで上書き可
  headers: {
    "Content-Type": "application/json",
  },
});

// トークン自動付与
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 認証API
export const register = (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => api.post("/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/login", data);

export const getMe = () => api.get("/me");

export const logout = () => api.post("/logout");

export default api;
