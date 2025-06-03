<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Country;

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
} 