"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import LoadingModal from "@/components/LoadingModal";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);
  const [registerAttempted, setRegisterAttempted] = useState(false);
  const showLoading = useMinimumLoading(loading, 1500);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterAttempted(true);
    await register(name, email, password, passwordConfirmation);
    if (!useAuthStore.getState().error) {
      router.push("/dashboard");
    }
  };

  return (
    <>
      {registerAttempted && showLoading && <LoadingModal message="作成中..." />}
      <Header />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-sky-100 sm:p-10">
        <div className="flex items-center gap-2 mb-6">
          <FaUserPlus className="text-2xl text-blue-500" />
          <h1 className="text-2xl font-bold tracking-wide text-blue-900">
            新規登録
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block mb-1 font-semibold text-gray-700"
              htmlFor="name"
            >
              ユーザー名
            </label>
            <input
              id="name"
              type="text"
              placeholder="ユーザー名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              required
            />
            {touched.name && !name && (
              <p className="text-red-500 text-sm mt-1">ユーザー名は必須です</p>
            )}
          </div>
          <div>
            <label
              className="block mb-1 font-semibold text-gray-700"
              htmlFor="email"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              required
            />
            {touched.email && !email && (
              <p className="text-red-500 text-sm mt-1">
                メールアドレスは必須です
              </p>
            )}
          </div>
          <div>
            <label
              className="block mb-1 font-semibold text-gray-700"
              htmlFor="password"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, password: true }))
                }
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition pr-10 h-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "パスワードを隠す" : "パスワードを表示"
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.password && !password && (
              <p className="text-red-500 text-sm mt-1">パスワードは必須です</p>
            )}
          </div>
          <div>
            <label
              className="block mb-1 font-semibold text-gray-700"
              htmlFor="passwordConfirmation"
            >
              パスワード（確認）
            </label>
            <div className="relative">
              <input
                id="passwordConfirmation"
                type={showPasswordConf ? "text" : "password"}
                placeholder="パスワード（確認）"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({
                    ...prev,
                    passwordConfirmation: true,
                  }))
                }
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition pr-10 h-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                onClick={() => setShowPasswordConf((v) => !v)}
                aria-label={
                  showPasswordConf
                    ? "パスワード（確認）を隠す"
                    : "パスワード（確認）を表示"
                }
              >
                {showPasswordConf ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.passwordConfirmation && !passwordConfirmation && (
              <p className="text-red-500 text-sm mt-1">
                パスワード（確認）は必須です
              </p>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white py-2 rounded-lg shadow-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
            disabled={
              loading || !name || !email || !password || !passwordConfirmation
            }
          >
            {loading ? "登録中..." : "新規登録"}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-blue-600 underline">
            ログイン
          </Link>
        </div>
      </div>
    </>
  );
}
