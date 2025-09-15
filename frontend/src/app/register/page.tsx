"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import {
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaCheckCircle,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";
import LoadingModal from "@/components/LoadingModal";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import AuthLoadingModal from "@/components/AuthLoadingModal";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const {
    register,
    loading,
    error,
    isAuthenticated,
    isAuthLoading,
    registrationSuccess,
    registrationMessage,
    registrationEmail,
    clearRegistrationState,
    resendVerificationEmail,
    resendLoading,
    resendSuccess,
    resendError,
    clearResendState,
  } = useAuthStore();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);
  const [registerAttempted, setRegisterAttempted] = useState(false);
  const showLoading = useMinimumLoading(loading, 1500);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (registrationSuccess) {
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirmation("");
      setTouched({});
      setRegisterAttempted(false);
    }
  }, [registrationSuccess]);

  useEffect(() => {
    return () => {
      clearRegistrationState();
    };
  }, [clearRegistrationState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterAttempted(true);
    await register(name, email, password, passwordConfirmation);
  };

  const handleTryAgain = () => {
    clearRegistrationState();
    clearResendState();
  };

  const handleResendEmail = async () => {
    clearResendState();
    if (registrationEmail) {
      await resendVerificationEmail(registrationEmail);
    }
  };

  return (
    <>
      {isAuthLoading && <AuthLoadingModal />}
      {registerAttempted && showLoading && <LoadingModal message="作成中..." />}
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        {/* 成功メッセージカード */}
        {registrationSuccess && (
          <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-6 bg-green-50 border border-green-200 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <FaCheckCircle className="text-2xl text-green-500" />
              <h2 className="text-xl font-bold text-green-800">
                アカウント作成完了
              </h2>
            </div>
            <div className="flex items-start gap-3 mb-4">
              <FaEnvelope className="text-lg text-green-500 mt-1" />
              <div className="flex-1">
                <p className="text-green-700 font-medium mb-2">
                  {registrationMessage}
                </p>
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
                  <p className="text-green-700 text-sm font-medium">
                    認証メール送信先：
                  </p>
                  <p className="text-green-800 font-bold">
                    {registrationEmail}
                  </p>
                </div>
                <p className="text-green-600 text-sm">
                  メールをご確認いただき、認証リンクをクリックしてからログインしてください。
                </p>
              </div>
            </div>

            {/* 再送信状態メッセージ */}
            {resendSuccess && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-700 text-sm font-medium">
                  {resendSuccess}
                </p>
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {resendError.split('\n').map((line, index) => (
                  <p key={index} className="text-red-700 text-sm font-medium">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* ボタンエリア */}
            <div className="flex gap-3 pt-4 border-t border-green-200">
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {resendLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    再送信中...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    認証メールを再送信
                  </>
                )}
              </button>
              <button
                onClick={handleTryAgain}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                別のアカウントを作成
              </button>
            </div>
          </div>
        )}

        {/* 新規登録フォームカード */}
        {!registrationSuccess && (
          <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-sky-100">
            <div className="flex items-center gap-2 mb-6">
              <FaUserPlus className="text-2xl text-blue-500" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-blue-900">
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
                  <p className="text-red-500 text-sm mt-1">
                    ユーザー名は必須です
                  </p>
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
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
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
                  loading ||
                  !name ||
                  !email ||
                  !password ||
                  !passwordConfirmation
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
        )}
      </div>
    </>
  );
}
