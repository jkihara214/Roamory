"use client";
import React, { useEffect } from "react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

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
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">ユーザー情報</h1>
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
