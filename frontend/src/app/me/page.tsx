import React from "react";

export default function MePage() {
  // ダミーユーザー情報
  const user = { name: "テストユーザー", email: "test@example.com" };
  const loading = false;

  const handleLogout = () => {
    // ここでログアウト処理を実装予定
    alert("ログアウトしました");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">ユーザー情報</h1>
      <div className="mb-4">
        <div className="text-lg font-semibold">{user.name}</div>
        <div className="text-gray-600">{user.email}</div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        ログアウト
      </button>
    </div>
  );
}
