# 国境線データについて

## 現在の実装

### country-bounds.json

- 主要 15 カ国の境界ボックスデータ
- フォールバック用の簡易データ

### countries-geojson.json

- 3 カ国（日本、アメリカ、イギリス）の実際の国境線
- 高品質な GeoJSON データ

## Natural Earth データの活用

### データソース

- **Natural Earth**: https://www.naturalearthdata.com/
- **ライセンス**: パブリックドメイン（無料、制限なし）
- **対象国**: 世界 258 カ国

### データ取得手順

#### 1. Natural Earth からダウンロード

```bash
# 高解像度版（推奨）
wget https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip

# 中解像度版（パフォーマンス重視）
wget https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip
```

#### 2. GeoJSON に変換

```bash
# OGR2OGRを使用（GDALツール）
ogr2ogr -f GeoJSON -select ISO_A2,NAME world-countries.geojson ne_10m_admin_0_countries.shp

# オンライン変換サービス
# - mapshaper.org
# - mygeodata.cloud
```

#### 3. データサイズの最適化

```bash
# TopoJSONで圧縮（オプション）
npm install -g topojson
geo2topo countries=world-countries.geojson > world-countries.topojson
```

### 実装例

#### フルワールド対応

```javascript
// 全世界の国境線を読み込み
const worldCountries = await fetch("/data/world-countries.geojson");

// 訪問済み国をハイライト
visitedCountryCodes.forEach((countryCode) => {
  const countryFeature = worldCountries.features.find(
    (feature) => feature.properties.ISO_A2 === countryCode
  );

  if (countryFeature) {
    L.geoJSON(countryFeature, {
      style: {
        color: "#22c55e",
        weight: 2,
        fillOpacity: 0.3,
      },
    }).addTo(map);
  }
});
```

## 今後の拡張予定

### Phase 1: 主要国対応（完了）

- [x] 日本、アメリカ、イギリス

### Phase 2: 全世界対応（完了）

- [x] Natural Earth データの統合（110m 解像度、258 カ国）
- [x] パフォーマンス最適化
- [ ] キャッシュ機能

### Phase 3: 高度な機能

- [ ] 詳細レベルの動的切り替え
- [ ] 国境線のアニメーション
- [ ] 訪問地域の統計表示

## 技術仕様

### ファイルサイズ比較

| データ                        | ファイルサイズ | 対象国数     | 精度   | 状態         |
| ----------------------------- | -------------- | ------------ | ------ | ------------ |
| 従来の実装                    | ~50KB          | 3 カ国       | 高     | 非推奨       |
| **現在の実装（110m 解像度）** | **779KB**      | **258 カ国** | **中** | **採用済み** |
| Natural Earth 50m             | ~781KB         | 258 カ国     | 高     | 未実装       |
| Natural Earth 10m             | ~4.7MB         | 258 カ国     | 最高   | 未実装       |

### 現在の設定

- **開発・本番環境**: 110m 解像度（779KB、258 カ国）
- **パフォーマンス**: 良好（1 秒以内でのロード）
- **精度**: 国境表示に十分な解像度

### 将来の拡張オプション

- **高精度が必要な場合**: 50m 解像度への変更可能
- **より軽量化が必要な場合**: TopoJSON 形式への変換検討
