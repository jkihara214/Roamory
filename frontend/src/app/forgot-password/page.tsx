"use client";
import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/v1/forgot-password", { email });
      setSentEmail(email);
      setSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 429) {
        // 429エラーでもサーバーからの具体的なメッセージを優先
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError("パスワードリセットメールの再送信は5分間隔で行えます。しばらくお待ちください。");
        }
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("エラーが発生しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-6">
            <FaEnvelope className="text-2xl text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-blue-900">
              パスワードリセット
            </h1>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 mb-3">
                  メールアドレスが登録されている場合、パスワードリセットメールを送信しました。
                </p>
                <div className="bg-white border border-green-300 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600 mb-1">送信先メールアドレス:</p>
                  <p className="text-lg font-semibold text-gray-800">{sentEmail}</p>
                </div>
                <p className="text-sm text-green-700">
                  上記のメールアドレス宛にパスワードリセット用のリンクを送信しました。
                  メールをご確認の上、リンクからパスワードをリセットしてください。
                </p>
                <p className="text-sm text-orange-600 mt-2">
                  ⏱️ リンクの有効期限は60分間です。
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  ※メールが届かない場合は、迷惑メールフォルダもご確認ください。
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FaArrowLeft />
                ログイン画面に戻る
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className="block mb-1 font-semibold text-gray-700"
                    htmlFor="email"
                  >
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="メールアドレスを入力"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    {error.split('\n').map((line, index) => (
                      <p key={index} className="text-red-700 text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white py-2 rounded-lg shadow-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
                  disabled={loading || !email}
                >
                  {loading ? "送信中..." : "リセットメールを送信"}
                </button>
              </form>

              <div className="mt-6 text-sm text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FaArrowLeft />
                  ログイン画面に戻る
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}