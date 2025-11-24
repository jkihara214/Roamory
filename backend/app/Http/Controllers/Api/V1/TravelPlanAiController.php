<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateTravelPlanRequest;
use Illuminate\Support\Facades\Http;
use App\Models\UsageHistory;
use Carbon\Carbon;
use App\Models\TravelPlan;
use App\Models\Country;

class TravelPlanAiController extends Controller
{
    public function generate(GenerateTravelPlanRequest $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        // 今日のtravel_plans_ai利用回数をカウント
        $count = UsageHistory::where('user_id', $user->id)
            ->where('feature_id', 1) // 1: travel_plans_ai
            ->where('created_at', '>=', $today)
            ->count();
        if ($count >= 5) {
            return response()->json([
                'error' => '本日のプラン生成回数上限（5回）に達しました。'
            ], 429);
        }

        // Gemini APIのエンドポイントとAPIキー（.envにGEMINI_API_URL, GEMINI_API_KEYを設定してください。URLはデフォルト値あり）
        $apiUrl = env('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent');
        $apiKey = env('GEMINI_API_KEY', 'YOUR_DUMMY_API_KEY');

        // AIへのプロンプト生成
        $prompt = $this->buildPrompt($request);

        // Gemini APIへのリクエスト
        $response = Http::post($apiUrl . '?key=' . $apiKey, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'AI生成に失敗しました'], 500);
        }

        $aiResult = $response->json();

        // 必要に応じてAIレスポンスを整形
        $planText = $aiResult['candidates'][0]['content']['parts'][0]['text'] ?? 'AI生成結果が取得できませんでした';

        // 利用履歴を追加
        UsageHistory::create([
            'user_id' => $user->id,
            'feature_id' => 1,
        ]);

        // country_idを取得（name_jaまたはname_enで検索）
        $country = Country::where('name_ja', $request->country)
            ->orWhere('name_en', $request->country)
            ->first();
        
        // 国が見つからない場合はエラーを返す
        if (!$country) {
            return response()->json([
                'error' => '指定された国「' . $request->country . '」が見つかりません。正しい国名を入力してください。'
            ], 422);
        }
        
        $countryId = $country->id;

        // travel_plansテーブルに保存
        $travelPlan = TravelPlan::create([
            'user_id' => $user->id,
            'country_id' => $countryId,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'budget' => $request->budget,
            'must_go_places' => $request->must_go_places ?? [],
            'plan_json' => [
                'markdown' => $planText,
                'raw_ai_response' => $aiResult,
            ],
        ]);

        return response()->json([
            'plan' => $planText,
            'travel_plan_id' => $travelPlan->id,
        ]);
    }

    private function buildPrompt(GenerateTravelPlanRequest $request): string
    {
        $base = <<<EOT
# 旅行プランナーAI

以下の条件で旅行プランを**指定形式で**作成してください。

## 条件
- **国**: {$request->country}
- **旅行期間**: {$request->start_date}（現地到着日時） 〜 {$request->end_date}（現地出発日時）
- **予算**: {$request->budget}円

**注意**:
- 現地到着日時と出発日時を考慮し、実際に観光できる時間帯に合わせてプランを作成してください
EOT;

        $places = $request->must_go_places ?? [];
        if (is_array($places) && count($places) > 0) {
            $placesStr = implode('、', $places);
            $base .= "\n- **必須訪問**: {$placesStr}";
        }

        $base .= <<<EOT

## 出力制約
- 各日3-5アクティビティ、説明50-100文字
- 移動時間・費用必須、昼夕食明記
- **各日間に区切り線（---）必須**

## 出力形式

### プラン概要
**期間**: [期間] ([X]日間) | **予算**: [予算]円 | **都市**: [都市名] | **スタイル**: [観光/グルメ重視等]

---

### 日程詳細

#### 1日目: [日付] ([曜日])
**テーマ**: [テーマ]

- **09:00-12:00** 📍 **[場所]** - [内容]（移動：[X]分、費用：約[X]円）
- **12:00-13:00** 🍽️ **昼食** - [店名/料理]（約[X]円）
- **13:00-17:00** 📍 **[場所]** - [内容]（移動：[X]分、費用：約[X]円）
- **19:00-21:00** 🍽️ **夕食** - [店名/料理]（約[X]円）

**宿泊**: [エリア]

---

#### [2日目以降も同形式、各日間に「---」必須]

---

### Tips
- [文化・マナー] - [持ち物] - [服装]

**形式厳守、区切り線必須で出力してください。**
EOT;
        return $base;
    }
} 