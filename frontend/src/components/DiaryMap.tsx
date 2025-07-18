"use client";

import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapClickEvent, TravelDiary } from "@/types/diary";
import { getDefaultTileProvider, mapConfig } from "@/config/mapConfig";

interface DiaryMapProps {
  onMapClick: (event: MapClickEvent) => void;
  diaries?: TravelDiary[];
  onDiaryClick?: (diary: TravelDiary) => void;
  clickedLocation?: MapClickEvent | null;
}

export default function DiaryMap({
  onMapClick,
  diaries = [],
  onDiaryClick,
  clickedLocation,
}: DiaryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const onDiaryClickRef = useRef(onDiaryClick);
  const markersRef = useRef<L.Marker[]>([]);
  const clickedMarkerRef = useRef<L.Marker | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // refの値を更新
  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onDiaryClickRef.current = onDiaryClick;
  }, [onMapClick, onDiaryClick]);

  // 日記のピンを更新
  useEffect(() => {
    if (!leafletMapRef.current) return;

    // 既存のマーカーを削除
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 新しいマーカーを追加
    diaries.forEach((diary) => {
      const marker = L.marker([diary.latitude, diary.longitude], {
        icon: L.divIcon({
          html: `<svg viewBox="0 0 384 512" width="20" height="20" fill="#3B82F6" style="display: block;">
                   <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
                 </svg>`,
          iconSize: [20, 20],
          className: "diary-marker",
          iconAnchor: [10, 20],
          popupAnchor: [0, -25], // ポップアップをピンから25px上に表示
        }),
      })
        .addTo(leafletMapRef.current!)
        .bindPopup(
          `
        <div class="diary-popup">
          <h3 class="font-bold text-sm mb-1">${diary.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${diary.content?.substring(
            0,
            100
          )}${diary.content?.length > 100 ? "..." : ""}</p>
          <p class="text-xs text-gray-500">${new Date(
            diary.created_at
          ).toLocaleDateString("ja-JP")}</p>
        </div>
      `
        )
        .on("click", () => {
          if (onDiaryClickRef.current) {
            onDiaryClickRef.current(diary);
          }
        });

      markersRef.current.push(marker);
    });
  }, [diaries]);

  // クリック位置のピンを更新
  useEffect(() => {
    if (!leafletMapRef.current) return;

    // 既存のクリックマーカーを削除
    if (clickedMarkerRef.current) {
      clickedMarkerRef.current.remove();
      clickedMarkerRef.current = null;
    }

    // 新しいクリック位置にマーカーを追加
    if (clickedLocation) {
      const clickedMarker = L.marker(
        [clickedLocation.lat, clickedLocation.lng],
        {
          icon: L.divIcon({
            html: `<svg viewBox="0 0 384 512" width="24" height="24" fill="#EF4444" style="display: block;">
                     <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
                   </svg>`,
            iconSize: [22, 22],
            className: "clicked-marker",
            iconAnchor: [11, 22],
            popupAnchor: [0, -20], // ポップアップをピンから20px上に表示
          }),
        }
      )
        .addTo(leafletMapRef.current!)
        .bindPopup(
          `
        <div class="clicked-popup">
          <h3 class="font-bold text-sm mb-1">新しい日記</h3>
          <p class="text-xs text-gray-600">この場所に日記を作成します</p>
          <p class="text-xs text-gray-500">座標: ${clickedLocation.lat.toFixed(
            6
          )}, ${clickedLocation.lng.toFixed(6)}</p>
        </div>
      `
        )
        .openPopup(); // 自動的にポップアップを開く

      clickedMarkerRef.current = clickedMarker;
    }
  }, [clickedLocation]);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;

      // 既に初期化されている場合はスキップ
      if (leafletMapRef.current) return;

      // 地図初期化
      const map = L.map(mapRef.current, {
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
      const mainTileLayer = L.tileLayer(tileProvider.url, {
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
      map.on("click", (e: L.LeafletMouseEvent) => {
        if (typeof onMapClickRef.current === "function") {
          onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      // エラーハンドリング（タイル読み込みエラー）
      mainTileLayer.on("tileerror", (e: L.TileErrorEvent) => {
        console.warn("Tile loading error:", e);
        // 必要に応じて代替タイルプロバイダーに切り替える処理をここに追加
      });
    };

    initializeMap();

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
              <span>地図をクリック → ピン表示・日記作成</span>
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
