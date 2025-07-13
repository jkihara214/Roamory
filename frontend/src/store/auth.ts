import { create } from "zustand";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
  resendVerificationEmailForUnverified,
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
  isAuthLoading: boolean;
  registrationSuccess: boolean;
  registrationMessage: string | null;
  registrationEmail: string | null;
  resendLoading: boolean;
  resendSuccess: string | null;
  resendError: string | null;
  emailUnverified: boolean;
  unverifiedEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearRegistrationState: () => void;
  clearResendState: () => void;
  clearEmailUnverifiedState: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isAuthLoading: true,
  registrationSuccess: false,
  registrationMessage: null,
  registrationEmail: null,
  resendLoading: false,
  resendSuccess: null,
  resendError: null,
  emailUnverified: false,
  unverifiedEmail: null,
  login: async (email, password) => {
    set({
      loading: true,
      error: null,
      emailUnverified: false,
      unverifiedEmail: null,
    });
    try {
      const res = await apiLogin({ email, password });
      set({ token: res.data.token, isAuthenticated: true });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.data.token);
      }
      const meRes = await getMe();
      set({ user: meRes.data });
    } catch (e) {
      const err = e as {
        response?: {
          status?: number;
          data?: { message?: string; email_verified?: boolean };
        };
      };

      // メール未認証の場合（403エラー）
      if (
        err?.response?.status === 403 &&
        err?.response?.data?.email_verified === false
      ) {
        set({
          emailUnverified: true,
          unverifiedEmail: email,
          error:
            err?.response?.data?.message ||
            "メールアドレスの認証が完了していません。",
        });
      } else {
        set({
          error: err?.response?.data?.message || "ログインに失敗しました",
        });
      }
    } finally {
      set({ loading: false });
    }
  },
  register: async (name, email, password, password_confirmation) => {
    set({
      loading: true,
      error: null,
      registrationSuccess: false,
      registrationMessage: null,
    });
    try {
      const res = await apiRegister({
        name,
        email,
        password,
        password_confirmation,
      });
      set({
        registrationSuccess: true,
        registrationMessage: res.data.message,
        registrationEmail: email,
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      set({ error: err?.response?.data?.message || "登録に失敗しました" });
    } finally {
      set({ loading: false });
    }
  },
  fetchMe: async () => {
    set({ loading: true, error: null, isAuthLoading: true });
    try {
      const res = await getMe();
      set({ user: res.data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false, isAuthLoading: false });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiLogout();
    } catch {}
    set({ user: null, token: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({ loading: false });
  },
  clearRegistrationState: () => {
    set({
      registrationSuccess: false,
      registrationMessage: null,
      registrationEmail: null,
      error: null,
    });
  },
  resendVerificationEmail: async (email) => {
    set({ resendLoading: true, resendSuccess: null, resendError: null });
    try {
      const res = await resendVerificationEmailForUnverified({ email });
      set({ resendSuccess: res.data.message || "認証メールを再送信しました" });
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      set({
        resendError:
          err?.response?.data?.message || "メールの再送に失敗しました",
      });
    } finally {
      set({ resendLoading: false });
    }
  },
  clearResendState: () => {
    set({ resendSuccess: null, resendError: null });
  },
  clearEmailUnverifiedState: () => {
    set({ emailUnverified: false, unverifiedEmail: null });
  },
}));
