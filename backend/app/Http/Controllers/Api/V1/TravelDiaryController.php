<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TravelDiary;
use App\Http\Requests\StoreTravelDiaryRequest;
use App\Http\Requests\UpdateTravelDiaryRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TravelDiaryController extends Controller
{
    /**
     * ユーザーの全日記を取得
     */
    public function index(Request $request): JsonResponse
    {
        $diaries = TravelDiary::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
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
        ]);

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

        $diary->update($request->only(['latitude', 'longitude', 'title', 'content']));

        return response()->json($diary);
    }

    /**
     * 日記を削除
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $diary = TravelDiary::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $diary->delete();

        return response()->json(['message' => '日記が削除されました']);
    }
} 