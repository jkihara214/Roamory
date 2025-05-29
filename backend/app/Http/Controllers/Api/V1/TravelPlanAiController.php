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
あなたは旅行プランナーです。
以下の条件で日本語で日別の旅行プランを作成してください。

国: {$request->country}
出発日: {$request->start_date}
帰着日: {$request->end_date}
予算: {$request->budget}円
EOT;

        $places = $request->must_go_places ?? [];
        if (is_array($places) && count($places) > 0) {
            $placesStr = implode('、', $places);
            $base .= "\n必ず行きたい場所: {$placesStr}";
        }

        $base .= "\n\n日毎のスケジュール、観光・移動・食事案を含めてください。";
        return $base;
    }
} 