// 地図タイルプロバイダーの設定
// 外部公開時は用途に応じて適切なプロバイダーを選択してください

export interface TileProvider {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  cost: "free" | "freemium" | "paid";
  suitableFor: string[];
  notes?: string;
}

export const tileProviders: Record<string, TileProvider> = {
  // 無料プロバイダー（開発・軽量利用向け）
  openstreetmap: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    cost: "free",
    suitableFor: ["development", "light-usage", "personal-projects"],
    notes:
      "OpenStreetMapの公式タイル。軽い使用のみ。商用・大量アクセス時は有料サービス推奨。",
  },

  opentopomap: {
    name: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
    cost: "free",
    suitableFor: ["development", "topographic-needs"],
    notes: "地形図スタイル。軽い使用のみ。",
  },
};

// デフォルト設定（環境に応じて切り替え）
export const getDefaultTileProvider = (): TileProvider => {
  // 開発環境ではOpenStreetMap
  return tileProviders.openstreetmap;
};

// 地図の初期設定
export const mapConfig = {
  center: [35.6762, 139.6503] as [number, number], // 東京
  zoom: 5,
  minZoom: 1,
  maxZoom: 18,
  zoomControl: true,
  attributionControl: true,

  // 地図の境界制限（緯度のみ制限、経度は無制限）
  maxBounds: [
    [-90, -Infinity], // 南西角（南極、経度無制限）
    [90, Infinity], // 北東角（北極、経度無制限）
  ] as [[number, number], [number, number]],

  // アプリケーション情報（規約対応）
  appInfo: {
    name: "Roamory",
    version: "1.0.0",
    contact: "https://github.com/jkihara214/Roamory", // 実際の連絡先に変更
    userAgent: "Roamory/1.0.0", // User-Agent識別用
  },
};
