<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TravelDiary;
use App\Models\VisitedCountry;
use App\Http\Requests\StoreTravelDiaryRequest;
use App\Http\Requests\UpdateTravelDiaryRequest;
use App\Services\GeocodingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class TravelDiaryController extends Controller
{
    /**
     * ユーザーの全日記を取得
     */
    public function index(Request $request): JsonResponse
    {
        $diaries = TravelDiary::where('user_id', $request->user()->id)
            ->orderBy('visited_at', 'desc')
            ->get();

        return response()->json($diaries);
    }

    /**
     * 日記を作成
     */
    public function store(StoreTravelDiaryRequest $request): JsonResponse
    {
        $diary = TravelDiary::create([
            'user_id' => $request->user()->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'title' => $request->title,
            'content' => $request->content,
            'visited_at' => $request->visited_at,
        ]);

        // 緯度経度から国を判定して訪問国に追加
        $this->addVisitedCountryFromCoordinates(
            $request->user()->id,
            $request->latitude,
            $request->longitude
        );

        return response()->json($diary, 201);
    }

    /**
     * 特定の日記を取得
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $diary = TravelDiary::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($diary);
    }

    /**
     * 日記を更新
     */
    public function update(UpdateTravelDiaryRequest $request, int $id): JsonResponse
    {
        $diary = TravelDiary::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // 位置が変更された場合、新しい国を訪問国に追加
        if ($request->has('latitude') && $request->has('longitude')) {
            $this->addVisitedCountryFromCoordinates(
                $request->user()->id,
                $request->latitude,
                $request->longitude
            );
        }

        $diary->update($request->only(['latitude', 'longitude', 'title', 'content', 'visited_at']));

        return response()->json($diary);
    }

    /**
     * 日記を削除
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $diary = TravelDiary::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // 削除前に訪問国のdiary_countを調整
        $this->decrementVisitedCountryFromCoordinates(
            $request->user()->id,
            $diary->latitude,
            $diary->longitude
        );

        $diary->delete();

        return response()->json(['message' => '日記が削除されました']);
    }

    /**
     * 緯度経度から国を判定して訪問国に追加
     */
    private function addVisitedCountryFromCoordinates(int $userId, float $latitude, float $longitude): void
    {
        try {
            $geocodingService = new GeocodingService();
            $country = $geocodingService->getCountryFromCoordinates($latitude, $longitude);

            if (!$country) {
                Log::info('Country not found for coordinates', [
                    'user_id' => $userId,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]);
                return;
            }

            // すでに訪問済みかチェック
            $existingVisit = VisitedCountry::where('user_id', $userId)
                ->where('country_id', $country->id)
                ->first();

            if ($existingVisit) {
                // 既存の場合はdiary_countをインクリメント
                $existingVisit->increment('diary_count');
                
                Log::info('Incremented diary count for visited country', [
                    'user_id' => $userId,
                    'country_id' => $country->id,
                    'country_name' => $country->name_ja,
                    'new_diary_count' => $existingVisit->fresh()->diary_count,
                ]);
                return;
            }

            // 新しい訪問国として追加（diary_count = 1）
            VisitedCountry::create([
                'user_id' => $userId,
                'country_id' => $country->id,
                'diary_count' => 1,
                'source_image_path' => '', // 日記からの登録なので空文字
                'detected_info' => [
                    'source' => 'travel_diary',
                    'coordinates' => [
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                    ],
                    'detected_at' => now()->toISOString(),
                ],
                'verified_at' => now(), // 日記からの登録は自動的に確認済みとする
            ]);

            Log::info('Added new visited country', [
                'user_id' => $userId,
                'country_id' => $country->id,
                'country_name' => $country->name_ja,
                'latitude' => $latitude,
                'longitude' => $longitude,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add visited country', [
                'user_id' => $userId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * 緯度経度から国を判定して訪問国のdiary_countをデクリメント
     */
    private function decrementVisitedCountryFromCoordinates(int $userId, float $latitude, float $longitude): void
    {
        try {
            $geocodingService = new GeocodingService();
            $country = $geocodingService->getCountryFromCoordinates($latitude, $longitude);

            if (!$country) {
                Log::info('Country not found for coordinates during deletion', [
                    'user_id' => $userId,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]);
                return;
            }

            // 該当国の訪問レコードを検索
            $existingVisit = VisitedCountry::where('user_id', $userId)
                ->where('country_id', $country->id)
                ->first();

            if (!$existingVisit) {
                Log::warning('No visited country record found for deletion', [
                    'user_id' => $userId,
                    'country_id' => $country->id,
                    'country_name' => $country->name_ja,
                ]);
                return;
            }

            // diary_countをデクリメント
            $existingVisit->decrement('diary_count');
            $existingVisit->refresh();

            // diary_countが0以下になったらレコードを削除
            if ($existingVisit->diary_count <= 0) {
                $existingVisit->delete();
                
                Log::info('Removed visited country (no more diaries)', [
                    'user_id' => $userId,
                    'country_id' => $country->id,
                    'country_name' => $country->name_ja,
                ]);
            } else {
                Log::info('Decremented diary count for visited country', [
                    'user_id' => $userId,
                    'country_id' => $country->id,
                    'country_name' => $country->name_ja,
                    'remaining_diary_count' => $existingVisit->diary_count,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to decrement visited country', [
                'user_id' => $userId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'error' => $e->getMessage(),
            ]);
        }
    }
} 