"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import Header from "@/components/Header";

type VerificationStatus =
  | "success"
  | "already_verified"
  | "invalid"
  | "error"
  | "loading";

interface StatusConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const emailParam = searchParams.get("email");

    setEmail(emailParam);

    if (
      statusParam &&
      ["success", "already_verified", "invalid", "error"].includes(statusParam)
    ) {
      setStatus(statusParam as VerificationStatus);
    } else {
      setStatus("error");
    }
  }, [searchParams]);

  const statusConfigs: Record<VerificationStatus, StatusConfig> = {
    loading: {
      icon: (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      ),
      title: "認証中...",
      message: "メールアドレスの認証を処理しています。",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
    },
    success: {
      icon: <FaCheckCircle className="text-4xl text-green-500" />,
      title: "認証完了！",
      message: "メールアドレスの認証が正常に完了しました。",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
    },
    already_verified: {
      icon: <FaInfoCircle className="text-4xl text-blue-500" />,
      title: "既に認証済み",
      message: "このメールアドレスは既に認証済みです。",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
    },
    invalid: {
      icon: <FaExclamationTriangle className="text-4xl text-yellow-500" />,
      title: "無効な認証リンク",
      message:
        "認証リンクが無効です。新しい認証メールをリクエストしてください。",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
    },
    error: {
      icon: <FaTimesCircle className="text-4xl text-red-500" />,
      title: "認証エラー",
      message: "認証処理中にエラーが発生しました。もう一度お試しください。",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
    },
  };

  const config = statusConfigs[status];

  return (
    <div className="flex flex-col items-center py-8 px-4 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md mx-auto">
        <div
          className={`p-8 rounded-2xl shadow-xl border ${config.bgColor} ${config.borderColor}`}
        >
          {/* アイコンとタイトル */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">{config.icon}</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {config.title}
            </h1>
            <p className="text-gray-600">{config.message}</p>
          </div>

          {/* メールアドレス表示 */}
          {email && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">
                認証されたメールアドレス:
              </p>
              <p className="font-semibold text-gray-800">{email}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3">
            {(status === "success" || status === "already_verified") && (
              <Link
                href="/login"
                className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
              >
                ログインページへ
              </Link>
            )}

            {(status === "invalid" || status === "error") && (
              <Link
                href="/register"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
              >
                新規登録ページへ
              </Link>
            )}

            <Link
              href="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium text-center transition-colors"
            >
              ホームページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailVerificationPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex flex-col items-center py-8 px-4 min-h-[calc(100vh-64px)]">
            <div className="w-full max-w-md mx-auto">
              <div className="p-8 rounded-2xl shadow-xl border bg-blue-50 border-blue-200">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    認証中...
                  </h1>
                  <p className="text-gray-600">
                    メールアドレスの認証を処理しています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <EmailVerificationContent />
      </Suspense>
    </>
  );
}
