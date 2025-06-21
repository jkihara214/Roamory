"use client";

import { useEffect, useRef, useState } from "react";
import { MapClickEvent } from "@/types/diary";
import { getDefaultTileProvider, mapConfig } from "@/config/mapConfig";

interface DiaryMapProps {
  onMapClick: (event: MapClickEvent) => void;
}

// Leaflet の型定義
declare global {
  interface Window {
    L: any;
  }
}

export default function DiaryMap({ onMapClick }: DiaryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const onMapClickRef = useRef(onMapClick);
  const [showHelp, setShowHelp] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // refの値を更新
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        initializeMap();
        return;
      }

      // Leaflet CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      // Leaflet JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.L) return;

      // 既に初期化されている場合はスキップ
      if (leafletMapRef.current) return;

      // 地図初期化
      const map = window.L.map(mapRef.current, {
        center: mapConfig.center,
        zoom: mapConfig.zoom,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        zoomControl: mapConfig.zoomControl,
        attributionControl: mapConfig.attributionControl,
        maxBounds: mapConfig.maxBounds,
        maxBoundsViscosity: 1.0, // 境界での「弾力性」を設定（1.0で完全に固定）
      });

      // 設定ファイルからタイルプロバイダーを取得
      const tileProvider = getDefaultTileProvider();

      // メインタイルレイヤー
      const mainTileLayer = window.L.tileLayer(tileProvider.url, {
        attribution: tileProvider.attribution,
        maxZoom: tileProvider.maxZoom,
        // 規約対応: User-Agent設定（Leafletが自動的に適切なUser-Agentを設定）
        // タイルキャッシュ設定（ブラウザの標準キャッシュを使用）
      }).addTo(map);

      // Leafletのクレジット表示を調整
      map.attributionControl.setPrefix(
        '<a href="https://leafletjs.com">Leaflet</a>'
      );

      leafletMapRef.current = map;

      // 地図クリックイベント（refを使用）
      map.on("click", (e: any) => {
        if (typeof onMapClickRef.current === "function") {
          onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      // エラーハンドリング（タイル読み込みエラー）
      mainTileLayer.on("tileerror", (e: any) => {
        console.warn("Tile loading error:", e);
        // 必要に応じて代替タイルプロバイダーに切り替える処理をここに追加
      });
    };

    loadLeaflet();

    // クリーンアップ処理
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []); // 依存配列を空にして初期化時のみ実行

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[380px] md:h-[450px] lg:h-[513px] rounded-lg border border-gray-200"
        role="application"
        aria-label="世界地図上での日記作成"
      />

      {/* コントロールボタン */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="bg-white bg-opacity-95 rounded-lg p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          title="操作ヘルプ"
        >
          <span className="text-lg">❓</span>
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="bg-white bg-opacity-95 rounded-lg p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          title="地図について"
        >
          <span className="text-lg">ℹ️</span>
        </button>
      </div>

      {/* 操作説明パネル（表示制御） */}
      {showHelp && (
        <div className="absolute top-22 left-3 bg-white bg-opacity-98 rounded-lg p-4 shadow-lg border border-gray-200 max-w-72 z-[1000]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🗺️</span>
              <span className="font-semibold text-gray-800">地図の操作</span>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="text-xs lg:text-sm text-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🖱️</span>
              <span>地図をクリック → 座標を取得</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">🔍</span>
              <span>マウスホイール → ズーム</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500">👆</span>
              <span>ドラッグ → 地図移動</span>
            </div>
          </div>
        </div>
      )}

      {/* 地図情報パネル（表示制御） */}
      {showInfo && (
        <div className="absolute bottom-5 left-3 bg-white bg-opacity-98 rounded-lg p-4 shadow-lg border border-gray-200 max-w-80 z-[1000]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="font-semibold text-gray-800">地図について</span>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="text-xs lg:text-sm text-gray-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">🌍</span>
              <div>
                <div>
                  地図データ: ©{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    OpenStreetMap
                  </a>{" "}
                  contributors
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">🔧</span>
              <div>
                <a
                  href="https://www.openstreetmap.org/fixthemap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  地図の改善を提案
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
