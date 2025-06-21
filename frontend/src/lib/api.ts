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

// ============================================
// 認証関連API（認証不要）
// ============================================
export const register = (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => api.post("/v1/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/v1/login", data);

// ============================================
// 公開API（認証不要）
// ============================================
export const getCountries = () => api.get("/v1/countries");

// ============================================
// 認証が必要なAPI
// ============================================

// ユーザー関連
export const getMe = () => api.get("/v1/me");
export const logout = () => api.post("/v1/logout");

// 旅行プラン生成
export const generateTravelPlan = (data: {
  country: string;
  start_date: string;
  end_date: string;
  budget: number | string;
  must_go_places?: string[];
}) => api.post("/v1/travel-plans/generate", data);

// 旅行日記（RESTful リソース）
export const getTravelDiaries = () => api.get("/v1/travel-diaries");

export const createTravelDiary = (data: {
  latitude: number;
  longitude: number;
  title: string;
  content: string;
}) => api.post("/v1/travel-diaries", data);

export const getTravelDiary = (id: number) =>
  api.get(`/v1/travel-diaries/${id}`);

export const updateTravelDiary = (
  id: number,
  data: {
    latitude?: number;
    longitude?: number;
    title?: string;
    content?: string;
  }
) => api.put(`/v1/travel-diaries/${id}`, data);

export const deleteTravelDiary = (id: number) =>
  api.delete(`/v1/travel-diaries/${id}`);

export default api;
