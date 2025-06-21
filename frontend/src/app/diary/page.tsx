"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import DiaryMap from "@/components/DiaryMap";
import DiaryForm from "@/components/DiaryForm";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { MapClickEvent, TravelDiary } from "@/types/diary";
import AuthLoadingModal from "@/components/AuthLoadingModal";
import {
  FaBook,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import {
  getTravelDiaries,
  createTravelDiary,
  updateTravelDiary,
  deleteTravelDiary,
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
  const [editingDiary, setEditingDiary] = useState<TravelDiary | null>(null);
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
    setEditingDiary(null);
    setShowForm(true);
  };

  const handleDiaryClick = (diary: TravelDiary) => {
    setEditingDiary(diary);
    setClickedLocation(null); // クリック位置のピンを削除
    setShowForm(true);
  };

  const handleCreateDiary = async (data: {
    title: string;
    content: string;
    latitude: number;
    longitude: number;
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

  const handleUpdateDiary = async (data: {
    title: string;
    content: string;
    latitude: number;
    longitude: number;
  }) => {
    if (!editingDiary) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await updateTravelDiary(editingDiary.id, data);
      setDiaries(
        diaries.map((d) => (d.id === editingDiary.id ? response.data : d))
      );
      setShowForm(false);
      setEditingDiary(null);
    } catch (err) {
      let message = "日記の更新に失敗しました";
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiary = async (id: number) => {
    if (!confirm("この日記を削除しますか？")) return;

    try {
      await deleteTravelDiary(id);
      setDiaries(diaries.filter((d) => d.id !== id));
    } catch (err) {
      let message = "日記の削除に失敗しました";
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    }
  };

  const handleModalSubmit = (data: {
    title: string;
    content: string;
    latitude: number;
    longitude: number;
  }) => {
    if (editingDiary) {
      handleUpdateDiary(data);
    } else {
      handleCreateDiary(data);
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
            />
          </div>

          {/* 日記一覧 */}
          {diaries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBook className="text-green-500" />
                あなたの日記 ({diaries.length}件)
              </h3>
              <div className="space-y-3">
                {diaries.map((diary) => (
                  <div
                    key={diary.id}
                    className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDiaryClick(diary)}
                  >
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
                          <span>
                            {new Date(diary.created_at).toLocaleDateString(
                              "ja-JP"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDiaryClick(diary);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                          title="編集"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDiary(diary.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          title="削除"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 日記作成フォーム */}
          {showForm && (
            <div className="mb-6">
              <DiaryForm
                onSubmit={handleModalSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setClickedLocation(null); // クリック位置のピンを削除
                  setEditingDiary(null);
                }}
                clickedLocation={clickedLocation}
                editingDiary={editingDiary}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
