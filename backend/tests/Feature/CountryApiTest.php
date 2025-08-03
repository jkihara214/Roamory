<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Country;
use App\Models\User;
use App\Models\VisitedCountry;

class CountryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_countries_index_returns_countries_list()
    {
        // ダミーデータを3件作成
        Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);
        Country::create([
            'name_ja' => 'アメリカ合衆国',
            'name_en' => 'United States',
            'code' => 'US',
            'geojson_url' => null,
        ]);
        Country::create([
            'name_ja' => 'フランス',
            'name_en' => 'France',
            'code' => 'FR',
            'geojson_url' => null,
        ]);

        $response = $this->getJson('/api/v1/countries');

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonFragment(['name_ja' => '日本'])
            ->assertJsonFragment(['name_ja' => 'アメリカ合衆国'])
            ->assertJsonFragment(['name_ja' => 'フランス']);
    }

    public function test_countries_index_returns_empty_when_no_data()
    {
        $response = $this->getJson('/api/v1/countries');
        $response->assertStatus(200)
            ->assertExactJson([]);
    }

    /**
     * 訪問済み国一覧の取得テスト
     */
    public function test_user_can_get_visited_countries()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        // 国データを作成
        $japan = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        $usa = Country::create([
            'name_ja' => 'アメリカ合衆国',
            'name_en' => 'United States',
            'code' => 'US',
            'geojson_url' => null,
        ]);

        // 訪問済み国データを作成
        VisitedCountry::create([
            'user_id' => $user->id,
            'country_id' => $japan->id,
            'diary_count' => 2,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        VisitedCountry::create([
            'user_id' => $user->id,
            'country_id' => $usa->id,
            'diary_count' => 1,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/countries/visited');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'country' => [
                        'id', 'name_ja', 'name_en', 'code', 'geojson_url'
                    ],
                    'visited_at',
                    'verified_at',
                ]
            ]);

        // 日本の情報が含まれているかチェック
        $response->assertJsonFragment([
            'country' => [
                'id' => $japan->id,
                'name_ja' => '日本',
                'name_en' => 'Japan',
                'code' => 'JP',
                'geojson_url' => null,
            ]
        ]);
    }

    /**
     * 訪問済み国コード一覧の取得テスト（地図ハイライト用）
     */
    public function test_user_can_get_visited_country_codes()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        // 国データを作成
        $japan = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        $france = Country::create([
            'name_ja' => 'フランス',
            'name_en' => 'France',
            'code' => 'FR',
            'geojson_url' => null,
        ]);

        // 訪問済み国データを作成
        VisitedCountry::create([
            'user_id' => $user->id,
            'country_id' => $japan->id,
            'diary_count' => 1,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        VisitedCountry::create([
            'user_id' => $user->id,
            'country_id' => $france->id,
            'diary_count' => 1,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/countries/visited-codes');

        $response->assertStatus(200)
            ->assertExactJson([
                'country_codes' => ['JP', 'FR']
            ]);
    }

    /**
     * 認証されていないユーザーは訪問済み国にアクセスできない
     */
    public function test_unauthenticated_user_cannot_access_visited_countries()
    {
        $response = $this->getJson('/api/v1/countries/visited');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/countries/visited-codes');
        $response->assertStatus(401);
    }

    /**
     * 他のユーザーの訪問済み国は取得できない
     */
    public function test_user_can_only_see_their_own_visited_countries()
    {
        $user1 = User::factory()->create(['email_verified_at' => now()]);
        $user2 = User::factory()->create(['email_verified_at' => now()]);
        $token1 = $user1->createToken('api-token')->plainTextToken;

        $japan = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        // user1の訪問済み国
        VisitedCountry::create([
            'user_id' => $user1->id,
            'country_id' => $japan->id,
            'diary_count' => 1,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        // user2の訪問済み国
        VisitedCountry::create([
            'user_id' => $user2->id,
            'country_id' => $japan->id,
            'diary_count' => 1,
            'source_image_path' => '',
            'detected_info' => ['source' => 'travel_diary'],
            'verified_at' => now(),
        ]);

        // user1でアクセス（自分の分のみ取得）
        $response = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->getJson('/api/v1/countries/visited');

        $response->assertStatus(200)
            ->assertJsonCount(1); // user1の分のみ

        // 国コードも同様
        $response = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->getJson('/api/v1/countries/visited-codes');

        $response->assertStatus(200)
            ->assertExactJson(['country_codes' => ['JP']]);
    }
} 