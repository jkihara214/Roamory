<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use App\Models\Country;

class TravelPlanAiTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGeminiApi()
    {
        Http::fake([
            '*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'ダミーAIプラン']
                            ]
                        ]
                    ]
                ]
            ], 200)
        ]);
    }

    public function test_generate_plan_with_places_success()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;
        $this->fakeGeminiApi();

        // Countryデータを作成
        Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
        ]);

        $payload = [
            'country' => '日本',
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
            'must_go_places' => ['東京', '京都'],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-plans/generate', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure(['plan']);
    }

    public function test_generate_plan_without_places_success()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;
        $this->fakeGeminiApi();

        // Countryデータを作成
        Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
        ]);

        $payload = [
            'country' => '日本',
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
            // must_go_places省略
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-plans/generate', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure(['plan']);
    }

    public function test_generate_plan_validation_error()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;
        $this->fakeGeminiApi();

        // Countryデータを作成
        Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
        ]);

        $payload = [
            // countryがない
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-plans/generate', $payload);

        $response->assertStatus(422);
    }

    public function test_generate_plan_unauthenticated()
    {
        $this->fakeGeminiApi();
        // Countryデータを作成
        Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
        ]);
        $payload = [
            'country' => '日本',
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
        ];
        $response = $this->postJson('/api/v1/travel-plans/generate', $payload);
        $response->assertStatus(401);
    }

    public function test_generate_plan_limit_exceeded()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;
        $this->fakeGeminiApi();
        Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
        ]);
        $payload = [
            'country' => '日本',
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
        ];
        for ($i = 0; $i < 5; $i++) {
            $this->withHeader('Authorization', 'Bearer ' . $token)
                ->postJson('/api/v1/travel-plans/generate', $payload)
                ->assertStatus(200);
        }
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-plans/generate', $payload)
            ->assertStatus(429)
            ->assertJsonFragment(['error' => '本日のプラン生成回数上限（5回）に達しました。']);
    }

    public function test_generate_plan_gemini_api_failure()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;
        Http::fake(['*' => Http::response([], 500)]);
        Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
        ]);
        $payload = [
            'country' => '日本',
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
        ];
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-plans/generate', $payload)
            ->assertStatus(500)
            ->assertJsonFragment(['error' => 'AI生成に失敗しました']);
    }

    public function test_generate_plan_country_not_found()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;
        $this->fakeGeminiApi();
        // Countryデータを作成しない
        $payload = [
            'country' => '日本',
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
        ];
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/travel-plans/generate', $payload);
        $response->assertStatus(422)
            ->assertJsonPath('error', '指定された国「日本」が見つかりません。正しい国名を入力してください。');
    }
} 