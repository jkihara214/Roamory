"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import DiaryForm from "@/components/DiaryForm";
import Link from "next/link";

// DiaryMapを動的インポートしてサーバーサイドレンダリングを無効化
const DiaryMap = dynamic(() => import("@/components/DiaryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] md:h-[450px] lg:h-[513px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">地図を読み込み中...</p>
      </div>
    </div>
  ),
});
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { MapClickEvent, TravelDiary } from "@/types/diary";
import AuthLoadingModal from "@/components/AuthLoadingModal";
import { FaBook, FaMapMarkerAlt, FaEye, FaClock } from "react-icons/fa";
import {
  getTravelDiaries,
  createTravelDiary,
} from "@/lib/api";
import { isAxiosError } from "axios";

export default function DiaryPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const router = useRouter();

  const [clickedLocation, setClickedLocation] = useState<MapClickEvent | null>(
    null
  );
  const [diaries, setDiaries] = useState<TravelDiary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // 認証完了後に日記一覧を取得
  useEffect(() => {
    if (isAuthenticated) {
      loadDiaries();
    }
  }, [isAuthenticated]);

  const loadDiaries = async () => {
    try {
      const response = await getTravelDiaries();
      setDiaries(response.data);
    } catch (err) {
      console.error("日記の取得に失敗しました:", err);
      setError("日記の取得に失敗しました");
    }
  };

  const handleMapClick = (event: MapClickEvent) => {
    setClickedLocation(event);
    setShowForm(true);
  };

  const handleDiaryClick = (diary: TravelDiary) => {
    router.push(`/diary/detail?id=${diary.id}`);
  };

  const handleCreateDiary = async (data: {
    title: string;
    content: string;
    latitude: number;
    longitude: number;
    visited_at: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createTravelDiary(data);
      setDiaries([response.data, ...diaries]);
      setShowForm(false);
      setClickedLocation(null);
    } catch (err) {
      let message = "日記の作成に失敗しました";
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
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
              地図をクリックすると、ピンが表示され下に日記作成フォームが表示されます
            </p>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 hover:text-red-800 text-xs underline"
              >
                閉じる
              </button>
            </div>
          )}

          {/* 地図エリア */}
          <div className="mb-6">
            <DiaryMap
              onMapClick={handleMapClick}
              diaries={diaries}
              onDiaryClick={handleDiaryClick}
              clickedLocation={clickedLocation}
              showVisitedCountries={true}
            />
          </div>

          {/* 日記一覧 */}
          {diaries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBook className="text-green-500" />
                あなたの日記 ({diaries.length}件)
              </h3>
              <div className="space-y-6">
                {(() => {
                  // 日記を訪問日時の年月でグループ化
                  const groupedDiaries: { [key: string]: TravelDiary[] } = {};
                  diaries.forEach((diary) => {
                    const date = new Date(diary.visited_at);
                    const yearMonth = `${date.getFullYear()}年${date.getMonth() + 1}月`;
                    if (!groupedDiaries[yearMonth]) {
                      groupedDiaries[yearMonth] = [];
                    }
                    groupedDiaries[yearMonth].push(diary);
                  });

                  // 年月を新しい順にソート
                  const sortedYearMonths = Object.keys(groupedDiaries).sort((a, b) => {
                    const [aYear, aMonth] = a.match(/\d+/g)!.map(Number);
                    const [bYear, bMonth] = b.match(/\d+/g)!.map(Number);
                    if (bYear !== aYear) return bYear - aYear;
                    return bMonth - aMonth;
                  });

                  return sortedYearMonths.map((yearMonth) => (
                    <div key={yearMonth}>
                      <h4 className="text-md font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                        {yearMonth}
                      </h4>
                      <div className="space-y-3">
                        {groupedDiaries[yearMonth].map((diary) => (
                          <Link
                            key={diary.id}
                            href={`/diary/detail?id=${diary.id}`}
                            className="block"
                          >
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">
                                    {diary.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {diary.content.length > 100
                                      ? `${diary.content.substring(0, 100)}...`
                                      : diary.content}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <FaMapMarkerAlt />
                                      {Number(diary.latitude).toFixed(4)},{" "}
                                      {Number(diary.longitude).toFixed(4)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FaClock className="text-blue-500" />
                                      訪問日時: {new Date(diary.visited_at).toLocaleString(
                                        "ja-JP",
                                        {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center ml-4">
                                  <span className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                                    <FaEye size={16} title="詳細を見る" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* 日記作成フォーム */}
          {showForm && (
            <div className="mb-6">
              <DiaryForm
                onSubmit={handleCreateDiary}
                onCancel={() => {
                  setShowForm(false);
                  setClickedLocation(null); // クリック位置のピンを削除
                }}
                clickedLocation={clickedLocation}
                editingDiary={null}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
