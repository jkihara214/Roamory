"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // トークンをlocalStorageに保存
      localStorage.setItem("token", token);

      // ダッシュボードにリダイレクト
      router.push("/dashboard");
    } else {
      // トークンがない場合はエラーページにリダイレクト
      router.push("/auth/email-verification-error");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">メール認証完了</h1>
        <p>ログイン中...</p>
      </div>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p>読み込み中...</p>
          </div>
        </div>
      }
    >
      <EmailVerifiedContent />
    </Suspense>
  );
}
