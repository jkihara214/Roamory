import React from "react";

export default function AuthLoadingModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-100/60">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid bg-transparent"></div>
    </div>
  );
}
