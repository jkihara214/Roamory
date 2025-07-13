"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaGlobeAsia } from "react-icons/fa";
import { useAuthStore } from "@/store/auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="bg-gradient-to-r from-sky-200 via-yellow-100 to-orange-100 shadow mb-2">
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
        <div className="flex items-center gap-4 justify-end text-base font-medium">
          {isAuthenticated ? (
            <>
              {/* PC/タブレット用ナビ */}
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className={`whitespace-nowrap hover:text-orange-500 transition ${
                    pathname === "/dashboard" ? "underline" : ""
                  }`}
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/diary"
                  className={`whitespace-nowrap hover:text-orange-500 transition ${
                    pathname === "/diary" ? "underline" : ""
                  }`}
                >
                  旅の日記
                </Link>
                <Link
                  href="/travel-plan"
                  className={`whitespace-nowrap hover:text-orange-500 transition ${
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
                  className="whitespace-nowrap bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white px-4 py-1 rounded-full shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  style={{ boxShadow: "0 2px 8px 0 rgba(255, 167, 38, 0.15)" }}
                >
                  ログアウト
                </button>
              </div>
              {/* スマホ用バーガーアイコン */}
              <button
                className="sm:hidden ml-2 p-2 rounded focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="メニューを開く"
              >
                <span className="block w-6 h-0.5 bg-blue-800 mb-1"></span>
                <span className="block w-6 h-0.5 bg-blue-800 mb-1"></span>
                <span className="block w-6 h-0.5 bg-blue-800"></span>
              </button>
              {/* スマホ用メニュー */}
              {menuOpen && (
                <div className="fixed inset-0 z-[1100] flex">
                  {/* 透過オーバーレイ（左側） */}
                  <div
                    className="flex-1 bg-black/40"
                    onClick={() => setMenuOpen(false)}
                    aria-label="メニューを閉じる"
                  />
                  {/* メニュー本体（右側） */}
                  <div className="bg-white w-2/3 max-w-xs h-full shadow-lg p-6 flex flex-col gap-6">
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="mb-4 self-end text-2xl"
                    >
                      ✕
                    </button>
                    <Link
                      href="/dashboard"
                      className={`whitespace-nowrap hover:text-orange-500 transition ${
                        pathname === "/dashboard" ? "underline" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      ダッシュボード
                    </Link>
                    <Link
                      href="/diary"
                      className={`whitespace-nowrap hover:text-orange-500 transition ${
                        pathname === "/diary" ? "underline" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      旅の日記
                    </Link>
                    <Link
                      href="/travel-plan"
                      className={`whitespace-nowrap hover:text-orange-500 transition ${
                        pathname === "/travel-plan" ? "underline" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      旅行プラン生成
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        setMenuOpen(false);
                        router.push("/login");
                      }}
                      className="whitespace-nowrap bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white px-4 py-1 rounded-full shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                      style={{
                        boxShadow: "0 2px 8px 0 rgba(255, 167, 38, 0.15)",
                      }}
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* PC/タブレット用ナビ（未ログイン時） */}
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/login"
                  className={`whitespace-nowrap px-4 py-1 rounded-full bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                    pathname === "/login" ? "underline" : ""
                  }`}
                  style={{ boxShadow: "0 2px 8px 0 rgba(38, 167, 255, 0.15)" }}
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className={`whitespace-nowrap px-4 py-1 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    pathname === "/register" ? "underline" : ""
                  }`}
                  style={{ boxShadow: "0 2px 8px 0 rgba(255, 167, 38, 0.15)" }}
                >
                  新規登録
                </Link>
              </div>
              {/* スマホ用バーガーアイコン（未ログイン時） */}
              <button
                className="sm:hidden ml-2 p-2 rounded focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="メニューを開く"
              >
                <span className="block w-6 h-0.5 bg-blue-800 mb-1"></span>
                <span className="block w-6 h-0.5 bg-blue-800 mb-1"></span>
                <span className="block w-6 h-0.5 bg-blue-800"></span>
              </button>
              {/* スマホ用メニュー（未ログイン時） */}
              {menuOpen && (
                <div className="fixed inset-0 z-[1100] flex">
                  {/* 透過オーバーレイ（左側） */}
                  <div
                    className="flex-1 bg-black/40"
                    onClick={() => setMenuOpen(false)}
                    aria-label="メニューを閉じる"
                  />
                  {/* メニュー本体（右側） */}
                  <div className="bg-white w-2/3 max-w-xs h-full shadow-lg p-6 flex flex-col gap-6">
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="mb-4 self-end text-2xl"
                    >
                      ✕
                    </button>
                    <Link
                      href="/login"
                      className={`whitespace-nowrap px-4 py-1 rounded-full bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                        pathname === "/login" ? "underline" : ""
                      }`}
                      style={{
                        boxShadow: "0 2px 8px 0 rgba(38, 167, 255, 0.15)",
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/register"
                      className={`whitespace-nowrap px-4 py-1 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white shadow transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                        pathname === "/register" ? "underline" : ""
                      }`}
                      style={{
                        boxShadow: "0 2px 8px 0 rgba(255, 167, 38, 0.15)",
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      新規登録
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
