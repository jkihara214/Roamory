"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { FaKey, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import api from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("無効なリセットリンクです。");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setError("パスワードが一致しません。");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/v1/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("エラーが発生しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-red-100">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">無効なリセットリンクです。</p>
              <Link
                href="/forgot-password"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                パスワードリセットをやり直す
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-green-100">
            <div className="text-center">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                パスワードがリセットされました
              </h2>
              <p className="text-gray-600 mb-4">
                3秒後にログイン画面へ移動します...
              </p>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                今すぐログイン画面へ
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-6">
            <FaKey className="text-2xl text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-blue-900">
              新しいパスワードを設定
            </h1>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-700">
              ⏱️ このリンクの有効期限は60分間です。期限切れの場合は再度リセットをリクエストしてください。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block mb-1 font-semibold text-gray-700"
                htmlFor="password"
              >
                新しいパスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8文字以上のパスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition pr-10"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label
                className="block mb-1 font-semibold text-gray-700"
                htmlFor="password_confirmation"
              >
                パスワード（確認）
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="パスワードを再入力"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition pr-10"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  aria-label={showPasswordConfirmation ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPasswordConfirmation ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                {error.split('\n').map((line, index) => (
                  <p key={index} className="text-red-700 text-sm">
                    {line}
                  </p>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white py-2 rounded-lg shadow-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
              disabled={loading || !password || !passwordConfirmation}
            >
              {loading ? "リセット中..." : "パスワードをリセット"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center">
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800"
            >
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}