"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import DiaryMap from "@/components/DiaryMap";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { MapClickEvent } from "@/types/diary";
import AuthLoadingModal from "@/components/AuthLoadingModal";
import { FaBook, FaMapMarkerAlt } from "react-icons/fa";

export default function DiaryPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const router = useRouter();

  const [clickedLocation, setClickedLocation] = useState<MapClickEvent | null>(
    null
  );

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleMapClick = (event: MapClickEvent) => {
    setClickedLocation(event);
    console.log("地図クリック座標:", event);
  };

  return (
    <>
      {isAuthLoading && <AuthLoadingModal />}
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-sky-100">
          {/* ページヘッダー */}
          <div className="flex items-center gap-2 mb-6">
            <FaBook className="text-2xl text-green-500" />
            <h1 className="text-2xl font-bold tracking-wide text-green-900">
              旅の日記
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-center">
              地図をクリックして、旅の思い出を記録しましょう
            </p>
          </div>

          {/* 地図エリア */}
          <div className="mb-6">
            <DiaryMap onMapClick={handleMapClick} />
          </div>

          {/* クリック情報表示 */}
          {clickedLocation && (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl shadow-md border border-blue-200">
              <h3 className="font-bold mb-4 text-blue-700 text-lg flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-400" />
                クリックした場所
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <span className="font-semibold text-gray-700 block">
                    緯度:
                  </span>
                  <span className="text-gray-800 font-mono">
                    {clickedLocation.lat.toFixed(6)}
                  </span>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <span className="font-semibold text-gray-700 block">
                    経度:
                  </span>
                  <span className="text-gray-800 font-mono">
                    {clickedLocation.lng.toFixed(6)}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 bg-opacity-60 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 次のステップで、この場所に日記を作成する機能を追加予定
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
