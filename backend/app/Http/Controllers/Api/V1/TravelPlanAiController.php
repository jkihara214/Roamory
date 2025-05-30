<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TravelPlanAiController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'country' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'budget' => 'required|integer',
            'must_go_places' => 'array',
            'must_go_places.*' => 'string',
        ]);

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

        return response()->json([
            'plan' => $planText,
        ]);
    }

    private function buildPrompt(Request $request): string
    {
        $base = <<<EOT
あなたはプロの旅行プランナーです。
以下の条件に基づき、日本語で分かりやすく、実用的な旅行プランを日ごとに作成してください。

【旅行条件】
・国: {$request->country}
・出発日: {$request->start_date}
・帰着日: {$request->end_date}
・予算: {$request->budget}円
EOT;

        $places = $request->must_go_places ?? [];
        if (is_array($places) && count($places) > 0) {
            $placesStr = implode('、', $places);
            $base .= "\n・必ず行きたい場所: {$placesStr}";
        }

        $base .= <<<EOT

【出力フォーマット】
1. 旅行プラン概要（国、日程、予算、主要都市、注意点など）
2. 日ごとの詳細スケジュール（午前・午後・夜など時間帯ごとに分けて記載）
3. 各日ごとに「移動手段」「食事」「観光地」「オプショナルツアー」なども具体的に記載
4. 可能であれば、地名や施設名は太字で強調
5. マークダウン形式で出力

【注意事項】
- 予算内で収まるように配慮してください
- 必ず行きたい場所は必ずスケジュールに含めてください
- 旅行初心者にも分かりやすい表現を心がけてください
EOT;
        return $base;
    }
} 