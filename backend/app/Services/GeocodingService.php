<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Country;

class GeocodingService
{
    /**
     * 緯度経度から国を判定する（逆ジオコーディング）
     * 
     * @param float $latitude
     * @param float $longitude
     * @return Country|null
     */
    public function getCountryFromCoordinates(float $latitude, float $longitude): ?Country
    {
        try {
            // Nominatim API（OpenStreetMap）を使用して逆ジオコーディング
            $response = Http::withHeaders([
                'User-Agent' => 'Roamory/1.0.0 (https://github.com/jkihara214/Roamory)',
            ])->get('https://nominatim.openstreetmap.org/reverse', [
                'format' => 'json',
                'lat' => $latitude,
                'lon' => $longitude,
                'zoom' => 3, // 国レベルの精度
                'addressdetails' => 1,
                'accept-language' => 'en', // 英語で取得
            ]);

            if ($response->failed()) {
                Log::warning('Nominatim API request failed', [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $data = $response->json();

            // レスポンスから国コードを取得
            $countryCode = null;
            
            // まず address の country_code を確認
            if (isset($data['address']['country_code'])) {
                $countryCode = strtoupper($data['address']['country_code']);
            }
            // 次に address の ISO3166-1 を確認
            elseif (isset($data['address']['ISO3166-1'])) {
                $countryCode = strtoupper($data['address']['ISO3166-1']);
            }
            // fallback として extratags を確認
            elseif (isset($data['extratags']['ISO3166-1:alpha2'])) {
                $countryCode = strtoupper($data['extratags']['ISO3166-1:alpha2']);
            }

            if (!$countryCode) {
                Log::warning('Country code not found in Nominatim response', [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'response' => $data,
                ]);
                return null;
            }

            // データベースから該当する国を検索
            $country = Country::where('code', $countryCode)->first();

            if (!$country) {
                Log::warning('Country not found in database', [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'country_code' => $countryCode,
                ]);
            }

            return $country;

        } catch (\Exception $e) {
            Log::error('Geocoding service error', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * レート制限を遵守するための待機
     * Nominatim APIは1秒に1リクエストまで
     */
    public function respectRateLimit(): void
    {
        sleep(1);
    }
} 