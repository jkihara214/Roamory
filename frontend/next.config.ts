import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  trailingSlash: true,
  // 静的エクスポート時にアセットパスを相対パスにする
  assetPrefix: "./",
};

export default nextConfig;
