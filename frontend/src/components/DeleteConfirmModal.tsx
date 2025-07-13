"use client";

import React from "react";
import { FaExclamationTriangle, FaTimes, FaTrash } from "react-icons/fa";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message = "この操作は取り消すことができません。",
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-gray-900/50 p-4"
      onClick={handleBackdropClick}
      data-testid="delete-modal-backdrop"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-2xl text-red-500" />
            <h3 className="text-xl font-bold text-gray-800">削除の確認</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            disabled={isLoading}
            title="閉じる"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <p className="text-gray-700 mb-2">
            <strong>「{title}」</strong>を削除しますか？
          </p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                削除中...
              </>
            ) : (
              <>
                <FaTrash size={16} />
                削除
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
