import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  trailingSlash: true,
  // 本番環境用の設定（CloudFront経由でアクセスする場合）
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://roamory.com' : '',
};

export default nextConfig;
