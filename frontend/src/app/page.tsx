import React from "react";
import {
  FaGlobeAsia,
  FaMapMarkedAlt,
  FaMagic,
  FaCameraRetro,
} from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-yellow-50 to-orange-100 flex flex-col items-center py-12 px-4">
      {/* ヒーローセクション */}
      <section className="flex flex-col items-center text-center mb-12">
        <div className="mb-4 animate-spin-slow">
          <FaGlobeAsia className="text-6xl text-blue-500 drop-shadow" />
        </div>
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4 tracking-tight"
          style={{ fontFamily: "Quicksand, Noto Sans JP, sans-serif" }}
        >
          Roamory
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-xl mb-6">
          旅する、記憶を残す。
          <br className="hidden sm:block" />
          AIと地図で、あなたの旅の思い出をもっと鮮やかに。
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          今すぐはじめる
        </Link>
      </section>

      {/* サービス特徴カード */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
          <FaMagic className="text-4xl text-pink-400 mb-3" />
          <h2 className="text-xl font-bold mb-2 text-blue-800">
            AI旅行プラン生成
          </h2>
          <p className="text-gray-600 text-sm">
            国・日付・予算を入力するだけで、AIがあなただけの旅行プランを自動作成。
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
          <FaMapMarkedAlt className="text-4xl text-sky-400 mb-3" />
          <h2 className="text-xl font-bold mb-2 text-blue-800">地図×日記</h2>
          <p className="text-gray-600 text-sm">
            世界地図にピンを立てて、旅の思い出や写真を日記として記録・可視化。
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
          <FaCameraRetro className="text-4xl text-orange-400 mb-3" />
          <h2 className="text-xl font-bold mb-2 text-blue-800">
            訪問国の可視化
          </h2>
          <p className="text-gray-600 text-sm">
            写真からAIが国を判別し、訪問国を地図上でハイライト表示。
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="text-gray-400 text-xs mt-auto">
        &copy; {new Date().getFullYear()} Roamory. All rights reserved.
      </footer>
    </div>
  );
}
