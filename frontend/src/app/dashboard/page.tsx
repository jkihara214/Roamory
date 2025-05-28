"use client";
import React, { useEffect } from "react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { FaThLarge } from "react-icons/fa";

export default function MePage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    // ここでログアウト処理を実装予定
    alert("ログアウトしました");
  };

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-sky-100 sm:p-10">
        <div className="flex items-center gap-2 mb-6">
          <FaThLarge className="text-2xl text-blue-500" />
          <h1 className="text-2xl font-bold tracking-wide text-blue-900">
            ダッシュボード
          </h1>
        </div>
        {loading && <div>読み込み中...</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {user && (
          <div className="space-y-2">
            <div>ユーザー名: {user.name}</div>
            <div>メールアドレス: {user.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          ログアウト
        </button>
      </div>
    </>
  );
}
