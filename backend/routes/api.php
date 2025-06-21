<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\V1\TravelPlanAiController;
use App\Http\Controllers\Api\V1\CountryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {
    // 認証関連API（認証不要）
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // 公開API（認証不要）
    Route::get('/countries', [CountryController::class, 'index']);
    
    // 認証が必要なAPI
    Route::middleware('auth:sanctum')->group(function () {
        // ユーザー関連
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // 旅行プラン生成
        Route::post('/travel-plans/generate', [TravelPlanAiController::class, 'generate']);
        
        // 旅行日記（RESTful リソース）
        Route::apiResource('travel-diaries', \App\Http\Controllers\Api\V1\TravelDiaryController::class);
    });
});
