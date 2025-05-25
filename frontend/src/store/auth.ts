import { create } from "zustand";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
} from "@/lib/api";

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await apiLogin({ email, password });
      set({ token: res.data.token, isAuthenticated: true });
      localStorage.setItem("token", res.data.token);
      const meRes = await getMe();
      set({ user: meRes.data });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "ログインに失敗しました" });
    } finally {
      set({ loading: false });
    }
  },
  register: async (name, email, password, password_confirmation) => {
    set({ loading: true, error: null });
    try {
      const res = await apiRegister({
        name,
        email,
        password,
        password_confirmation,
      });
      set({ token: res.data.token, isAuthenticated: true });
      localStorage.setItem("token", res.data.token);
      const meRes = await getMe();
      set({ user: meRes.data });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "登録に失敗しました" });
    } finally {
      set({ loading: false });
    }
  },
  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMe();
      set({ user: res.data, isAuthenticated: true });
    } catch (e: any) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiLogout();
    } catch (e) {}
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
    set({ loading: false });
  },
}));
