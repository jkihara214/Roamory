<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\TravelDiary;

class TravelDiaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_travel_diary()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $payload = [
            'latitude' => 35.6762,
            'longitude' => 139.6503,
            'title' => '東京旅行',
            'content' => '東京タワーを見ました。とても綺麗でした。',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-diaries', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id', 'user_id', 'latitude', 'longitude', 'title', 'content', 'created_at', 'updated_at'
            ]);

        $this->assertDatabaseHas('travel_diaries', [
            'user_id' => $user->id,
            'title' => '東京旅行',
            'content' => '東京タワーを見ました。とても綺麗でした。',
        ]);
    }

    public function test_user_can_get_their_travel_diaries()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $otherUser = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        // ユーザーの日記を作成
        TravelDiary::factory()->create([
            'user_id' => $user->id,
            'title' => 'ユーザーの日記',
        ]);

        // 他のユーザーの日記を作成
        TravelDiary::factory()->create([
            'user_id' => $otherUser->id,
            'title' => '他のユーザーの日記',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/travel-diaries');

        $response->assertStatus(200)
            ->assertJsonCount(1) // 自分の日記のみ取得
            ->assertJsonPath('0.title', 'ユーザーの日記');
    }

    public function test_user_can_update_their_travel_diary()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $diary = TravelDiary::factory()->create([
            'user_id' => $user->id,
            'title' => '元のタイトル',
            'content' => '元の内容',
        ]);

        $payload = [
            'title' => '更新されたタイトル',
            'content' => '更新された内容',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/travel-diaries/{$diary->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('title', '更新されたタイトル')
            ->assertJsonPath('content', '更新された内容');
    }

    public function test_user_cannot_update_other_users_diary()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $otherUser = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $diary = TravelDiary::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $payload = [
            'title' => '更新しようとしたタイトル',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/travel-diaries/{$diary->id}", $payload);

        $response->assertStatus(404);
    }

    public function test_user_can_delete_their_travel_diary()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $diary = TravelDiary::factory()->create([
            'user_id' => $user->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/travel-diaries/{$diary->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('travel_diaries', ['id' => $diary->id]);
    }

    public function test_validation_errors_for_invalid_data()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        // 緯度が範囲外
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-diaries', [
                'latitude' => 100, // 無効な緯度
                'longitude' => 139.6503,
                'title' => 'テスト',
                'content' => 'テスト内容',
            ]);

        $response->assertStatus(422);

        // 必須項目が空
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-diaries', [
                'latitude' => 35.6762,
                'longitude' => 139.6503,
                'title' => '', // 空のタイトル
                'content' => 'テスト内容',
            ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_user_cannot_access_diaries()
    {
        $response = $this->getJson('/api/v1/travel-diaries');
        $response->assertStatus(401);

        $response = $this->postJson('/api/v1/travel-diaries', [
            'latitude' => 35.6762,
            'longitude' => 139.6503,
            'title' => 'テスト',
            'content' => 'テスト内容',
        ]);
        $response->assertStatus(401);
    }


} 