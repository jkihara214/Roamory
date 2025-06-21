<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TravelDiary;
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
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:10000',
        ]);

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
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string|max:10000',
        ]);

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