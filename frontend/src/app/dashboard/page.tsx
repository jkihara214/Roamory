"use client";
import React, { useEffect } from "react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { FaThLarge, FaMapMarkedAlt, FaBook } from "react-icons/fa";
import AuthLoadingModal from "@/components/AuthLoadingModal";
import Link from "next/link";

export default function MePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const router = useRouter();

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  return (
    <>
      {isAuthLoading && <AuthLoadingModal />}
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-sky-100">
          <div className="flex items-center gap-2 mb-6">
            <FaThLarge className="text-2xl text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-blue-900">
              ダッシュボード
            </h1>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Link
              href="/travel-plan"
              className="block bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-md border border-sky-200 p-6 hover:shadow-xl transition group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaMapMarkedAlt className="text-2xl text-blue-400 group-hover:text-blue-600 transition" />
                <span className="text-lg font-bold text-blue-700">
                  旅行プラン生成
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                AIで旅行プランを自動作成できます。
              </div>
            </Link>

            <Link
              href="/diary"
              className="block bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-md border border-green-200 p-6 hover:shadow-xl transition group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaBook className="text-2xl text-green-400 group-hover:text-green-600 transition" />
                <span className="text-lg font-bold text-green-700">
                  旅の日記
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                地図をクリックして旅の思い出を記録できます。
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
