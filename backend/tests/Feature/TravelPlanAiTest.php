<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Http;

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
        $payload = [
            'country' => '日本',
            'start_date' => '2024-07-01',
            'end_date' => '2024-07-05',
            'budget' => 100000,
        ];
        $response = $this->postJson('/api/v1/travel-plans/generate', $payload);
        $response->assertStatus(401);
    }
} 