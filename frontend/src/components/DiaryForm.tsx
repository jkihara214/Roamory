"use client";

import React, { useState, useEffect } from "react";
import { MapClickEvent, TravelDiary } from "@/types/diary";
import { FaBook, FaTimes, FaSave } from "react-icons/fa";

interface DiaryFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    latitude: number;
    longitude: number;
  }) => void;
  onCancel: () => void;
  clickedLocation?: MapClickEvent | null;
  editingDiary?: TravelDiary | null;
  isLoading?: boolean;
}

export default function DiaryForm({
  onSubmit,
  onCancel,
  clickedLocation,
  editingDiary,
  isLoading = false,
}: DiaryFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (editingDiary) {
      setTitle(editingDiary.title);
      setContent(editingDiary.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editingDiary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const location = editingDiary
      ? { lat: editingDiary.latitude, lng: editingDiary.longitude }
      : clickedLocation;

    if (!location) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      latitude: location.lat,
      longitude: location.lng,
    });
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    onCancel();
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg border border-green-200 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBook className="text-xl text-green-500" />
          <h3 className="text-xl font-bold text-gray-800">
            {editingDiary ? "日記を編集" : "新しい日記を作成"}
          </h3>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          disabled={isLoading}
          title="キャンセル"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* タイトル */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            placeholder="日記のタイトルを入力してください"
            maxLength={255}
            required
            disabled={isLoading}
          />
        </div>

        {/* 内容 */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white"
            placeholder="旅の思い出を記録してください..."
            maxLength={10000}
            required
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            {content.length}/10000文字
          </p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading || !title.trim() || !content.trim()}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                保存中...
              </>
            ) : (
              <>
                <FaSave size={16} />
                {editingDiary ? "更新" : "保存"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
