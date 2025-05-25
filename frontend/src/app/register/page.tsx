"use client";
import React from "react";
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
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password, passwordConfirmation);
    if (!useAuthStore.getState().error) {
      router.push("/me");
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">新規登録</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ユーザー名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="パスワード（確認）"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={loading}
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
