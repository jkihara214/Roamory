<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\TravelDiary;
use App\Models\Country;
use App\Models\VisitedCountry;

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

    /**
     * ハイライト機能のテスト: 日記作成時に訪問済み国が追加される
     */
    public function test_creating_diary_adds_visited_country()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        // 日本の国データを準備
        $country = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        $payload = [
            'latitude' => 35.6762,  // 東京の座標
            'longitude' => 139.6503,
            'title' => '東京旅行',
            'content' => '東京タワーを見ました。',
        ];

        // GeocodingServiceをモック化してJPを返すようにする
        $this->mock(\App\Services\GeocodingService::class, function ($mock) use ($country) {
            $mock->shouldReceive('getCountryFromCoordinates')
                ->with(35.6762, 139.6503)
                ->andReturn($country);
        });

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-diaries', $payload);

        $response->assertStatus(201);

        // visited_countriesテーブルに追加されているかチェック
        $this->assertDatabaseHas('visited_countries', [
            'user_id' => $user->id,
            'country_id' => $country->id,
            'diary_count' => 1,
        ]);
    }

    /**
     * ハイライト機能のテスト: 同じ国で複数日記作成時にdiary_countが増加
     */
    public function test_creating_multiple_diaries_in_same_country_increments_count()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $country = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        // GeocodingServiceをモック化
        $this->mock(\App\Services\GeocodingService::class, function ($mock) use ($country) {
            $mock->shouldReceive('getCountryFromCoordinates')
                ->andReturn($country);
        });

        // 1つ目の日記作成
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-diaries', [
                'latitude' => 35.6762,
                'longitude' => 139.6503,
                'title' => '東京旅行1日目',
                'content' => '東京駅に到着',
            ]);

        // 2つ目の日記作成（同じ国）
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-diaries', [
                'latitude' => 34.7024,  // 大阪の座標
                'longitude' => 135.4959,
                'title' => '大阪旅行',
                'content' => '大阪城を見学',
            ]);

        // diary_countが2になっているかチェック
        $visitedCountry = VisitedCountry::where('user_id', $user->id)
            ->where('country_id', $country->id)
            ->first();

        $this->assertNotNull($visitedCountry);
        $this->assertEquals(2, $visitedCountry->diary_count);
    }

    /**
     * ハイライト機能のテスト: 日記削除時にdiary_countが減少
     */
    public function test_deleting_diary_decrements_count()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $country = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        // 先にvisited_countryを作成（diary_count = 2）
        $visitedCountry = VisitedCountry::create([
            'user_id' => $user->id,
            'country_id' => $country->id,
            'diary_count' => 2,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        $diary = TravelDiary::factory()->create([
            'user_id' => $user->id,
            'latitude' => 35.6762,
            'longitude' => 139.6503,
        ]);

        // GeocodingServiceをモック化
        $this->mock(\App\Services\GeocodingService::class, function ($mock) use ($country) {
            $mock->shouldReceive('getCountryFromCoordinates')
                ->with(35.6762, 139.6503)
                ->andReturn($country);
        });

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/travel-diaries/{$diary->id}");

        $response->assertStatus(200);

        // diary_countが1に減っているかチェック
        $visitedCountry->refresh();
        $this->assertEquals(1, $visitedCountry->diary_count);
    }

    /**
     * ハイライト機能のテスト: 最後の日記削除時にvisited_countryが削除される
     */
    public function test_deleting_last_diary_removes_visited_country()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $country = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        // visited_countryを作成（diary_count = 1）
        VisitedCountry::create([
            'user_id' => $user->id,
            'country_id' => $country->id,
            'diary_count' => 1,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        $diary = TravelDiary::factory()->create([
            'user_id' => $user->id,
            'latitude' => 35.6762,
            'longitude' => 139.6503,
        ]);

        // GeocodingServiceをモック化
        $this->mock(\App\Services\GeocodingService::class, function ($mock) use ($country) {
            $mock->shouldReceive('getCountryFromCoordinates')
                ->with(35.6762, 139.6503)
                ->andReturn($country);
        });

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/v1/travel-diaries/{$diary->id}");

        $response->assertStatus(200);

        // visited_countryが削除されているかチェック
        $this->assertDatabaseMissing('visited_countries', [
            'user_id' => $user->id,
            'country_id' => $country->id,
        ]);
    }


} 