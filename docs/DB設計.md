# 📄 データベース構成（Roamory / PostgreSQL）

## 👤 users（一般ユーザー）

| カラム名                | 型            | 補足                              |
| ----------------------- | ------------- | --------------------------------- |
| id                      | bigIncrements | 主キー                            |
| name                    | string        | ユーザー名                        |
| email                   | string        | メールアドレス（ユニーク）        |
| email_verified_at       | timestamp     | メール確認日時                    |
| password                | string        | ハッシュ化されたパスワード        |
| remember_token          | string        | セッション用トークン              |
| is_premium              | boolean       | 課金ユーザーかどうか（true=課金） |
| created_at / updated_at | timestamps    | 作成 / 更新日時                   |

---

## 👤 admins（管理ユーザー）

| カラム名                | 型            | 補足                       |
| ----------------------- | ------------- | -------------------------- |
| id                      | bigIncrements | 主キー                     |
| name                    | string        | 管理者名                   |
| email                   | string        | メールアドレス（ユニーク） |
| email_verified_at       | timestamp     | メール確認日時             |
| password                | string        | ハッシュ化されたパスワード |
| remember_token          | string        | セッション用トークン       |
| created_at / updated_at | timestamps    | 作成 / 更新日時            |

---

## 🌍 countries（国情報）

| カラム名                | 型                | 補足                                                       |
| ----------------------- | ----------------- | ---------------------------------------------------------- |
| id                      | bigIncrements     | 主キー                                                     |
| name_ja                 | string            | 国名（日本語例：日本）                                     |
| name_en                 | string            | 国名（英語例：Japan）                                      |
| code                    | string(2)         | ISO 3166-1 alpha-2 コード（例：JP）                        |
| geojson_url             | string (nullable) | 国境線 GeoJSON ファイルの URL（S3 など外部ストレージ想定） |
| created_at / updated_at | timestamps        | 作成 / 更新日時                                            |

---

## 🧠 travel_plans（旅行プラン）

| カラム名                | 型            | 補足                               |
| ----------------------- | ------------- | ---------------------------------- |
| id                      | bigIncrements | 主キー                             |
| user_id                 | foreignId     | users テーブル参照                 |
| country_id              | foreignId     | countries テーブル参照             |
| start_date              | date          | 出発日                             |
| end_date                | date          | 帰着日                             |
| budget                  | integer       | 予算（単位：円など）               |
| must_go_places          | json          | 必ず行きたい場所リスト             |
| plan_json               | json          | ✅ AI 出力内容（スケジュールなど） |
| created_at / updated_at | timestamps    | 作成 / 更新日時                    |

---

## 🗺️ travel_diaries（旅行日記）

| カラム名                | 型             | 補足               |
| ----------------------- | -------------- | ------------------ |
| id                      | bigIncrements  | 主キー             |
| user_id                 | foreignId      | users テーブル参照 |
| latitude                | decimal(10, 7) | 緯度               |
| longitude               | decimal(10, 7) | 経度               |
| title                   | string         | 日記タイトル       |
| content                 | text           | 日記本文           |
| created_at / updated_at | timestamps     | 作成 / 更新日時    |

### 🔗 travel_diary_images（旅行日記の画像）

| カラム名                | 型            | 補足                                 |
| ----------------------- | ------------- | ------------------------------------ |
| id                      | bigIncrements | 主キー                               |
| travel_diary_id         | foreignId     | travel_diaries 参照                  |
| image_path              | string        | 画像のパス（開発：public、本番：S3） |
| created_at / updated_at | timestamps    | 作成 / 更新日時                      |

📌 画像は最大 4 件まで（アプリ側バリデーション等で制御）

---

## 📍 visited_countries（訪問国）

| カラム名                | 型              | 補足                                 |
| ----------------------- | --------------- | ------------------------------------ |
| id                      | bigIncrements   | 主キー                               |
| user_id                 | foreignId       | users テーブル参照                   |
| country_id              | foreignId       | countries テーブル参照               |
| source_image_path       | string          | 画像のパス（開発：public、本番：S3） |
| detected_info           | json (nullable) | ✅ AI 判別結果（建造物名・説明など） |
| verified_at             | timestamp       | AI による確認日時                    |
| created_at / updated_at | timestamps      | 作成 / 更新日時                      |

---

## 📝 usage_histories（機能利用履歴）

| カラム名                | 型            | 補足                        |
| ----------------------- | ------------- | --------------------------- |
| id                      | bigIncrements | 主キー                      |
| user_id                 | foreignId     | users テーブル参照          |
| feature_id              | integer       | 機能 ID（下記対応表を参照） |
| created_at / updated_at | timestamps    | 作成 / 更新日時             |

- 機能利用時にレコードを追加
- 「本日分の利用回数」を `SELECT COUNT(*) FROM usage_histories WHERE user_id = ? AND feature_id = ? AND created_at >= 今日の0時` で取得
- 制限回数を超えていれば API でエラー返却
- 履歴が残るため、将来的な分析や柔軟な制限（週・月単位など）にも対応可能

### 機能 ID と機能名の対応表

| feature_id | 機能名               |
| ---------- | -------------------- |
| 1          | travel_plans_ai      |
| 2          | visited_countries_ai |

## ✅ 補足事項

- 国選択には `countries` テーブルを使用し、ISO コードを利用することで他 API 連携にも便利です。
- 国の地理ポリゴン（国境線 GeoJSON）は `countries.geojson_url` で管理し、Leaflet でハイライト表示に利用します。
- AI 出力内容（旅行プラン、画像判別結果など）は `json` カラムで保存します。
- 画像パスは **開発環境：`public/`、本番環境：S3** を使い分けます。
- ユーザーの課金状態は `users.is_premium` で管理し、地図表示は課金状態に応じて Leaflet（無料ユーザー）または Mapbox GL JS（課金ユーザー）を使い分けます。
