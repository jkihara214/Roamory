"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaSignInAlt, FaMailBulk } from "react-icons/fa";
import LoadingModal from "@/components/LoadingModal";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import AuthLoadingModal from "@/components/AuthLoadingModal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const emailUnverified = useAuthStore((s) => s.emailUnverified);
  const unverifiedEmail = useAuthStore((s) => s.unverifiedEmail);
  const resendVerificationEmail = useAuthStore(
    (s) => s.resendVerificationEmail
  );
  const clearEmailUnverifiedState = useAuthStore(
    (s) => s.clearEmailUnverifiedState
  );
  const resendLoading = useAuthStore((s) => s.resendLoading);
  const resendSuccess = useAuthStore((s) => s.resendSuccess);
  const resendError = useAuthStore((s) => s.resendError);
  const clearResendState = useAuthStore((s) => s.clearResendState);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const showLoading = useMinimumLoading(loading, 1500);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempted(true);
    await login(email, password);
    if (!useAuthStore.getState().error) {
      router.push("/dashboard");
    }
  };

  const handleResendEmail = async () => {
    clearResendState();
    if (unverifiedEmail) {
      await resendVerificationEmail(unverifiedEmail);
    }
  };

  const handleBackToLogin = () => {
    clearEmailUnverifiedState();
    clearResendState();
    setEmail("");
    setPassword("");
    setLoginAttempted(false);
  };

  // メール未認証状態の場合の表示
  if (emailUnverified) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-orange-100">
            <div className="flex items-center gap-2 mb-6">
              <FaMailBulk className="text-2xl text-orange-500" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-orange-900">
                メール認証が必要です
              </h1>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 mb-3">
                ログインするには、メールアドレスの認証が必要です。
              </p>
              <p className="text-sm text-orange-700 mb-3">
                送信先: <strong>{unverifiedEmail}</strong>
              </p>
              <p className="text-sm text-orange-600">
                認証メール内のリンクをクリックしてメール認証を完了してください。
              </p>
            </div>

            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 text-sm">{resendSuccess}</p>
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {resendError.split('\n').map((line, index) => (
                  <p key={index} className="text-red-700 text-sm">
                    {line}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white py-2 rounded-lg shadow-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
              >
                {resendLoading ? "送信中..." : "認証メールを再送信"}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg shadow-lg font-bold text-lg transition-all duration-200"
              >
                ログイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isAuthLoading && <AuthLoadingModal />}
      {loginAttempted && showLoading && <LoadingModal message="確認中..." />}
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-sky-100">
          <div className="flex items-center gap-2 mb-6">
            <FaSignInAlt className="text-2xl text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-blue-900">
              ログイン
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <p className="text-red-500 text-sm mt-1">
                  パスワードは必須です
                </p>
              )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white py-2 rounded-lg shadow-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
              disabled={loading || !email || !password}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
          <div className="mt-4 text-sm text-center">
            <div>
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-blue-600 underline">
                新規登録
              </Link>
            </div>
            <div className="mt-2">
              <Link href="/forgot-password" className="text-blue-600 underline">
                パスワードをお忘れの方
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
