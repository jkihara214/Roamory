import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api", // .env.localで上書き可
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
}) => api.post("/v1/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/v1/login", data);

export const getMe = () => api.get("/v1/me");

export const logout = () => api.post("/v1/logout");

export const getCountries = () => api.get("/v1/countries");

export const generateTravelPlan = (data: {
  country: string;
  start_date: string;
  end_date: string;
  budget: number | string;
  must_go_places?: string[];
}) => api.post("/v1/travel-plans/generate", data);

export default api;
