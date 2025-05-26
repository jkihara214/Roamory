"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

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
    await register(name, email, password, passwordConfirmation);
    if (!useAuthStore.getState().error) {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return <div className="text-center mt-20">判定中...</div>;
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">新規登録</h1>
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
            <input
              id="password"
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              required
            />
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
            <input
              id="passwordConfirmation"
              type="password"
              placeholder="パスワード（確認）"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, passwordConfirmation: true }))
              }
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              required
            />
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
