import React from "react";
import { FaPlane } from "react-icons/fa";

export default function LoadingModal({ message = "処理中..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-100/60">
      <style>
        {`
          @keyframes flyAway {
            0% {
              transform: translate(0, 0) scale(1) rotate(-10deg);
              opacity: 1;
            }
            60% {
              opacity: 1;
              transform: translate(80px, -60px) scale(1.15) rotate(8deg);
            }
            100% {
              transform: translate(180px, -120px) scale(1.3) rotate(18deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="bg-gradient-to-br from-blue-400 to-sky-300 rounded-2xl p-10 flex flex-col items-center shadow-2xl border border-blue-200 relative overflow-visible">
        {/* 飛行機 */}
        <div
          style={{
            animation: "flyAway 1.0s cubic-bezier(.4,1.6,.6,1) infinite",
            position: "absolute",
            left: "20px",
            top: "70px",
            zIndex: 1,
          }}
        >
          <FaPlane className="text-4xl text-white drop-shadow" />
        </div>
        {/* スピナー・メッセージ */}
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-white border-solid mb-4 mt-16"></div>
        <div className="text-lg font-bold text-white drop-shadow">
          {message}
        </div>
        <div className="text-xs text-white mt-2 opacity-80">
          旅の思い出を準備中...
        </div>
      </div>
    </div>
  );
}
