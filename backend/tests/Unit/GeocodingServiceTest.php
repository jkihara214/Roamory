<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\GeocodingService;
use App\Models\Country;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Testing\RefreshDatabase;

class GeocodingServiceTest extends TestCase
{
    use RefreshDatabase;

    private GeocodingService $geocodingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->geocodingService = new GeocodingService();
    }

    /**
     * 正常な座標で国が正しく特定される
     */
    public function test_get_country_from_coordinates_success()
    {
        // テスト用の国データを作成
        $japan = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        // Nominatim APIのレスポンスをモック
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => [
                    'country' => 'Japan',
                    'country_code' => 'jp'
                ],
                'lat' => '35.6762',
                'lon' => '139.6503'
            ], 200)
        ]);

        $result = $this->geocodingService->getCountryFromCoordinates(35.6762, 139.6503);

        $this->assertInstanceOf(Country::class, $result);
        $this->assertEquals('JP', $result->code);
        $this->assertEquals('Japan', $result->name_en);
    }

    /**
     * ISO3166-1フィールドから国コードが取得される
     */
    public function test_get_country_from_iso3166_field()
    {
        $france = Country::create([
            'name_ja' => 'フランス',
            'name_en' => 'France',
            'code' => 'FR',
            'geojson_url' => null,
        ]);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => [
                    'country' => 'France',
                    'ISO3166-1' => 'fr'
                ],
                'lat' => '48.8566',
                'lon' => '2.3522'
            ], 200)
        ]);

        $result = $this->geocodingService->getCountryFromCoordinates(48.8566, 2.3522);

        $this->assertInstanceOf(Country::class, $result);
        $this->assertEquals('FR', $result->code);
    }

    /**
     * extratagsから国コードが取得される（fallback）
     */
    public function test_get_country_from_extratags_fallback()
    {
        $spain = Country::create([
            'name_ja' => 'スペイン',
            'name_en' => 'Spain',
            'code' => 'ES',
            'geojson_url' => null,
        ]);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => [
                    'country' => 'Spain'
                ],
                'extratags' => [
                    'ISO3166-1:alpha2' => 'es'
                ],
                'lat' => '40.4168',
                'lon' => '-3.7038'
            ], 200)
        ]);

        $result = $this->geocodingService->getCountryFromCoordinates(40.4168, -3.7038);

        $this->assertInstanceOf(Country::class, $result);
        $this->assertEquals('ES', $result->code);
    }

    /**
     * API のレスポンスで国コードが見つからない場合
     */
    public function test_get_country_returns_null_when_country_code_not_found()
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => [
                    'country' => 'Unknown'
                ],
                'lat' => '0.0',
                'lon' => '0.0'
            ], 200)
        ]);

        $result = $this->geocodingService->getCountryFromCoordinates(0.0, 0.0);

        $this->assertNull($result);
    }

    /**
     * データベースに該当する国が存在しない場合
     */
    public function test_get_country_returns_null_when_country_not_in_database()
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => [
                    'country' => 'Unknown Country',
                    'country_code' => 'xx'
                ],
                'lat' => '0.0',
                'lon' => '0.0'
            ], 200)
        ]);

        $result = $this->geocodingService->getCountryFromCoordinates(0.0, 0.0);

        $this->assertNull($result);
    }

    /**
     * API リクエストが失敗した場合
     */
    public function test_get_country_returns_null_when_api_request_fails()
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([], 500)
        ]);

        $result = $this->geocodingService->getCountryFromCoordinates(35.6762, 139.6503);

        $this->assertNull($result);
    }

    /**
     * APIリクエストでHTTP例外が発生した場合
     */
    public function test_get_country_returns_null_when_http_exception_occurs()
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => function ($request) {
                throw new \Exception('Network error');
            }
        ]);

        $result = $this->geocodingService->getCountryFromCoordinates(35.6762, 139.6503);

        $this->assertNull($result);
    }

    /**
     * 正しいUser-Agentヘッダーが設定される
     */
    public function test_correct_user_agent_header_is_set()
    {
        $japan = Country::create([
            'name_ja' => '日本',
            'name_en' => 'Japan',
            'code' => 'JP',
            'geojson_url' => null,
        ]);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => [
                    'country' => 'Japan',
                    'country_code' => 'jp'
                ]
            ], 200)
        ]);

        $this->geocodingService->getCountryFromCoordinates(35.6762, 139.6503);

        Http::assertSent(function ($request) {
            return $request->hasHeader('User-Agent', 'Roamory/1.0.0 (https://github.com/jkihara214/Roamory)');
        });
    }

    /**
     * 正しいクエリパラメータが送信される
     */
    public function test_correct_query_parameters_are_sent()
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                'address' => [
                    'country' => 'Japan',
                    'country_code' => 'jp'
                ]
            ], 200)
        ]);

        $this->geocodingService->getCountryFromCoordinates(35.6762, 139.6503);

        Http::assertSent(function ($request) {
            $url = $request->url();
            return str_contains($url, 'format=json') &&
                   str_contains($url, 'lat=35.6762') &&
                   str_contains($url, 'lon=139.6503') &&
                   str_contains($url, 'zoom=3') &&
                   str_contains($url, 'addressdetails=1') &&
                   str_contains($url, 'accept-language=en');
        });
    }

    /**
     * レート制限メソッドが正しく動作する
     */
    public function test_respect_rate_limit_method()
    {
        $start = microtime(true);
        $this->geocodingService->respectRateLimit();
        $end = microtime(true);

        $duration = $end - $start;
        
        // 少なくとも1秒は待機する
        $this->assertGreaterThanOrEqual(1.0, $duration);
        // 最大で1.1秒程度（処理時間含む）
        $this->assertLessThan(1.1, $duration);
    }
}