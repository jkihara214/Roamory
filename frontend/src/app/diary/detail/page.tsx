"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import DiaryForm from "@/components/DiaryForm";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import AuthLoadingModal from "@/components/AuthLoadingModal";
import { FaBook, FaMapMarkerAlt, FaEdit, FaTrash, FaArrowLeft, FaCalendar, FaClock } from "react-icons/fa";
import { useAuthStore } from "@/store/auth";
import { getTravelDiary, getTravelDiaries, updateTravelDiary, deleteTravelDiary } from "@/lib/api";
import { TravelDiary } from "@/types/diary";
import { isAxiosError } from "axios";

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

export default function DiaryDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [diary, setDiary] = useState<TravelDiary | null>(null);
  const [allDiaries, setAllDiaries] = useState<TravelDiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // 認証完了後に日記を取得
  useEffect(() => {
    if (isAuthenticated && id) {
      loadDiary();
    } else if (isAuthenticated && !id) {
      // IDが指定されていない場合は一覧ページへ
      router.push("/diary");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  const loadDiary = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // 個別の日記を取得
      const response = await getTravelDiary(Number(id));
      setDiary(response.data);
      
      // 全ての日記も取得（地図に表示するため）
      const allDiariesResponse = await getTravelDiaries();
      setAllDiaries(allDiariesResponse.data);
    } catch (err) {
      console.error("日記の取得に失敗しました:", err);
      if (isAxiosError(err) && err.response?.status === 404) {
        setError("日記が見つかりません");
      } else {
        setError("日記の取得に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: {
    title: string;
    content: string;
    latitude: number;
    longitude: number;
    visited_at: string;
  }) => {
    if (!diary) return;

    setIsUpdating(true);
    setError(null);
    try {
      const response = await updateTravelDiary(diary.id, data);
      setDiary(response.data);
      setIsEditing(false);
    } catch (err) {
      let message = "日記の更新に失敗しました";
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!diary) return;

    setIsDeleting(true);
    try {
      await deleteTravelDiary(diary.id);
      router.push("/diary");
    } catch (err) {
      let message = "日記の削除に失敗しました";
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  if (isAuthLoading || isLoading) {
    return <AuthLoadingModal />;
  }

  if (error && !diary) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-sky-100">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push("/diary")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                日記一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!diary) return null;

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title={diary.title}
          isLoading={isDeleting}
        />
      )}
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-sky-100">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/diary")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft />
              <span>日記一覧に戻る</span>
            </button>
            {!isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaEdit />
                  <span>編集</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash />
                  <span>削除</span>
                </button>
              </div>
            )}
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

          {isEditing ? (
            // 編集フォーム
            <div className="mb-6">
              <DiaryForm
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
                editingDiary={diary}
                isLoading={isUpdating}
              />
            </div>
          ) : (
            <>
              {/* 詳細画面タイトル */}
              <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBook className="text-green-500" />
                日記詳細
              </h1>
              
              {/* 日記詳細表示 */}
              <div className="mb-6">
                {/* 緯度経度、作成日時、最終更新 */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt />
                    {Number(diary.latitude).toFixed(4)}, {Number(diary.longitude).toFixed(4)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendar />
                    作成日: {new Date(diary.created_at).toLocaleDateString("ja-JP")}
                  </span>
                  {diary.updated_at !== diary.created_at && (
                    <span className="flex items-center gap-1">
                      <FaClock className="text-gray-500" />
                      最終更新: {new Date(diary.updated_at).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                </div>
                
                {/* 訪問日時 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">訪問日時</label>
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-blue-500" />
                      <span className="text-gray-800">
                        {new Date(diary.visited_at).toLocaleString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* タイトル */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">タイトル</label>
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {diary.title}
                    </h3>
                  </div>
                </div>
                
                {/* 内容 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">内容</label>
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{diary.content}</p>
                  </div>
                </div>
              </div>

              {/* 場所（地図表示） */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-500" />
                  場所
                </h3>
                <DiaryMap
                  onMapClick={() => {}}
                  diaries={allDiaries}
                  onDiaryClick={(clickedDiary) => {
                    // 他の日記がクリックされたら、その詳細ページに遷移
                    if (clickedDiary.id !== diary.id) {
                      router.push(`/diary/detail?id=${clickedDiary.id}`);
                    }
                  }}
                  clickedLocation={null}
                  showVisitedCountries={true}
                  centerOnDiary={diary}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}