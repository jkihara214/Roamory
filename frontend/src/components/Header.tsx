"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaGlobeAsia } from "react-icons/fa";
import { useAuthStore } from "@/store/auth";

// 仮の認証状態（今後Zustandに差し替え）
const user = false; // ログイン時はtrueに

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="bg-gradient-to-r from-sky-200 via-yellow-100 to-orange-100 shadow mb-8">
      <nav className="flex items-center px-6 py-3">
        <div className="flex-1 flex items-center gap-2">
          <FaGlobeAsia className="text-2xl text-blue-600 drop-shadow animate-spin-slow" />
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-wide font-sans text-blue-800 hover:text-orange-500 transition"
            style={{ fontFamily: "Quicksand, Noto Sans JP, sans-serif" }}
          >
            Roamory
          </Link>
        </div>
        <div className="flex items-center gap-4 justify-end flex-1 text-base font-medium">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`hover:text-orange-500 transition ${
                  pathname === "/dashboard" ? "underline" : ""
                }`}
              >
                ダッシュボード
              </Link>
              <Link
                href="/travel-plan"
                className={`hover:text-orange-500 transition ${
                  pathname === "/travel-plan" ? "underline" : ""
                }`}
              >
                旅行プラン生成
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
                className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white px-4 py-1 rounded-full shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ boxShadow: "0 2px 8px 0 rgba(255, 167, 38, 0.15)" }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-4 py-1 rounded-full bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                  pathname === "/login" ? "underline" : ""
                }`}
                style={{ boxShadow: "0 2px 8px 0 rgba(38, 167, 255, 0.15)" }}
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className={`px-4 py-1 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                  pathname === "/register" ? "underline" : ""
                }`}
                style={{ boxShadow: "0 2px 8px 0 rgba(255, 167, 38, 0.15)" }}
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
