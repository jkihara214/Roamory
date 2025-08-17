"use client";

import React, { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapClickEvent, TravelDiary } from "@/types/diary";
import { getDefaultTileProvider, mapConfig } from "@/config/mapConfig";
import { getVisitedCountryCodes } from "@/lib/api";
import { isAxiosError } from "axios";

interface DiaryMapProps {
  onMapClick: (event: MapClickEvent) => void;
  diaries?: TravelDiary[];
  onDiaryClick?: (diary: TravelDiary) => void;
  clickedLocation?: MapClickEvent | null;
  showVisitedCountries?: boolean;
  centerOnDiary?: TravelDiary | null;
}

export default function DiaryMap({
  onMapClick,
  diaries = [],
  onDiaryClick,
  clickedLocation,
  showVisitedCountries = false,
  centerOnDiary = null,
}: DiaryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const onDiaryClickRef = useRef(onDiaryClick);
  const markersRef = useRef<L.Marker[]>([]);
  const clickedMarkerRef = useRef<L.Marker | null>(null);
  const highlightLayersRef = useRef<L.Rectangle[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [visitedCountryCodes, setVisitedCountryCodes] = useState<string[]>([]);
  const [countryGeoJson, setCountryGeoJson] = useState<any>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // refの値を更新
  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onDiaryClickRef.current = onDiaryClick;
  }, [onMapClick, onDiaryClick]);

  // 日記のピンを更新
  useEffect(() => {
    // 地図が初期化されていない場合はスキップ
    if (!leafletMapRef.current || !isMapInitialized) return;

    // 既存のマーカーを削除
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 新しいマーカーを追加
    diaries.forEach((diary) => {
      // centerOnDiaryと同じ日記の場合は赤いピン、それ以外は青いピン
      const isHighlighted = centerOnDiary && centerOnDiary.id === diary.id;
      const pinColor = isHighlighted ? "#EF4444" : "#3B82F6"; // 赤 or 青
      const pinSize = isHighlighted ? 24 : 20; // 強調表示の場合は少し大きく

      const marker = L.marker([diary.latitude, diary.longitude], {
        icon: L.divIcon({
          html: `<svg viewBox="0 0 384 512" width="${pinSize}" height="${pinSize}" fill="${pinColor}" style="display: block;">
                   <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
                 </svg>`,
          iconSize: [pinSize, pinSize],
          className: isHighlighted
            ? "highlighted-diary-marker"
            : "diary-marker",
          iconAnchor: [pinSize / 2, pinSize],
          popupAnchor: [0, -25], // ポップアップをピンから25px上に表示
        }),
      })
        .addTo(leafletMapRef.current!)
        .bindPopup(
          `
        <div class="diary-popup" style="min-width: 200px;">
          <a href="/diary/detail?id=${diary.id}" 
             class="font-bold text-sm mb-2 text-blue-600 hover:text-blue-800 hover:underline block"
             style="color: #2563eb; text-decoration: none;"
             onmouseover="this.style.textDecoration='underline'"
             onmouseout="this.style.textDecoration='none'">
            ${diary.title}
          </a>
          <p class="text-xs text-gray-600 mt-2">
            <svg class="inline-block w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            訪問日時: ${new Date(diary.visited_at).toLocaleString(
              "ja-JP",
              {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        </div>
      `
        );

      markersRef.current.push(marker);
    });
  }, [diaries, centerOnDiary, isMapInitialized]);

  // クリック位置のピンを更新
  useEffect(() => {
    if (!leafletMapRef.current || !isMapInitialized) return;

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
  }, [clickedLocation, isMapInitialized]);

  // 国境線データを読み込み
  useEffect(() => {
    const loadCountryData = async () => {
      try {
        // Natural Earth 110m精度のGeoJSONデータ
        const worldCountriesResponse = await fetch(
          "/data/world-countries-110m.geojson"
        );
        const worldCountriesData = await worldCountriesResponse.json();
        setCountryGeoJson(worldCountriesData);

        console.log(
          `Loaded ${
            worldCountriesData.features?.length || 0
          } countries from Natural Earth 110m data`
        );
      } catch (error) {
        console.error("Failed to load Natural Earth 110m data:", error);
        console.warn("Country highlighting will not be available");
      }
    };
    loadCountryData();
  }, []);

  // 訪問済み国データを取得
  useEffect(() => {
    if (showVisitedCountries) {
      // デバウンス用のタイマー
      const timeoutId = setTimeout(() => {
        const fetchVisitedCountries = async () => {
          try {
            const response = await getVisitedCountryCodes();
            setVisitedCountryCodes(response.data.country_codes);
          } catch (error) {
            // 429エラーの場合は詳細なログを出力
            if (isAxiosError(error) && error.response?.status === 429) {
              console.warn(
                "Rate limit exceeded for visited countries API. Using cached data."
              );
            } else {
              console.error("Failed to fetch visited countries:", error);
            }
            setVisitedCountryCodes([]);
          }
        };
        fetchVisitedCountries();
      }, 500); // 500ms待機してから実行

      return () => clearTimeout(timeoutId);
    }
  }, [showVisitedCountries, diaries]);

  // 訪問済み国をハイライト表示
  useEffect(() => {
    if (!leafletMapRef.current || !showVisitedCountries || !isMapInitialized) return;

    // 既存のハイライトレイヤーを削除
    highlightLayersRef.current.forEach((layer) => layer.remove());
    highlightLayersRef.current = [];

    // 訪問済み国をハイライト
    visitedCountryCodes.forEach((countryCode) => {
      // Natural Earth FeatureCollectionからの検索
      if (countryGeoJson?.features) {
        const countryFeature = countryGeoJson.features.find((feature: any) => {
          const props = feature.properties;
          // 複数のフィールドをチェック（Natural Earthデータの不整合に対応）
          return (
            props.ISO_A2 === countryCode ||
            props.ISO_A2_EH === countryCode || // Enhanced版ISO_A2
            props.WB_A2 === countryCode ||
            props.POSTAL === countryCode
          );
        });

        if (countryFeature) {
          // 実際の国境線を表示
          const geoJsonLayer = L.geoJSON(countryFeature, {
            style: {
              color: "#22c55e",
              weight: 2,
              opacity: 0.8,
              fillColor: "#bbf7d0",
              fillOpacity: 0.3,
            },
            interactive: false, // クリックイベントを地図本体に透過
          }).addTo(leafletMapRef.current!).bindPopup(`
              <div class="visited-country-popup">
                <h3 class="font-bold text-sm mb-1">✈️ 訪問済み</h3>
                <p class="text-sm text-gray-700">${
                  countryFeature.properties.NAME_JA ||
                  countryFeature.properties.NAME
                }</p>
                <p class="text-xs text-gray-500 mt-1">実際の国境線で表示</p>
                <p class="text-xs text-gray-400 mt-1">${
                  countryFeature.properties.SUBREGION ||
                  countryFeature.properties.CONTINENT
                }</p>
              </div>
            `);

          highlightLayersRef.current.push(geoJsonLayer as any);
        }
      }
    });
  }, [visitedCountryCodes, countryGeoJson, showVisitedCountries, isMapInitialized]);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;

      // 既に初期化されている場合はスキップ
      if (leafletMapRef.current) return;

      // 中心位置を決定（centerOnDiaryが指定されていればその位置、なければデフォルト）
      const initialCenter = mapConfig.center;
      const initialZoom = mapConfig.zoom;

      // 地図初期化
      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        zoomControl: mapConfig.zoomControl,
        attributionControl: mapConfig.attributionControl,
        worldCopyJump: true, // 世界地図をループさせる際に自動的にジャンプ
        maxBounds: mapConfig.maxBounds,
        maxBoundsViscosity: 0.2, // 境界での「弾力性」を設定
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
          // 経度を-180〜180の範囲に正規化
          let lng = e.latlng.lng;
          while (lng > 180) lng -= 360;
          while (lng < -180) lng += 360;
          
          onMapClickRef.current({ lat: e.latlng.lat, lng: lng });
        }
      });

      // エラーハンドリング（タイル読み込みエラー）
      mainTileLayer.on("tileerror", (e: L.TileErrorEvent) => {
        console.warn("Tile loading error:", e);
        // 必要に応じて代替タイルプロバイダーに切り替える処理をここに追加
      });

      // 地図の初期化が完了したことを示す
      setIsMapInitialized(true);
    };

    initializeMap();

    // クリーンアップ処理
    return () => {
      // ハイライトレイヤーを削除
      highlightLayersRef.current.forEach((layer) => layer.remove());
      highlightLayersRef.current = [];

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, []); // 初期化は一度だけ実行

  // centerOnDiaryが指定されている場合、その位置に地図を移動
  useEffect(() => {
    if (!leafletMapRef.current || !centerOnDiary || !isMapInitialized) return;

    // 地図の中心を移動（アニメーション付き）
    leafletMapRef.current.setView(
      [Number(centerOnDiary.latitude), Number(centerOnDiary.longitude)],
      7, // ズームレベル
      {
        animate: true,
        duration: 0.5,
      }
    );
  }, [centerOnDiary, isMapInitialized]);

  return (
    <div className="relative" data-testid="map-container">
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
            {showVisitedCountries && visitedCountryCodes.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">🗺️</span>
                <div>
                  <div className="font-medium text-green-700">
                    訪問済み国: {visitedCountryCodes.length}カ国
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {countryGeoJson ? (
                      <>
                        <span className="text-green-600">●</span> Natural Earth
                        110m精度で表示
                      </>
                    ) : (
                      "日記を作成した国が自動的に記録されます"
                    )}
                  </div>
                </div>
              </div>
            )}
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
