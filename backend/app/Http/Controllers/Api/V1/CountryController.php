<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\VisitedCountry;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index()
    {
        // 必要なカラムのみ返す
        $countries = Country::select('id', 'name_ja', 'name_en', 'code', 'geojson_url')->get();
        return response()->json($countries);
    }

    /**
     * ユーザーの訪問済み国一覧を取得
     */
    public function visitedCountries(Request $request)
    {
        $userId = $request->user()->id;

        $visitedCountries = VisitedCountry::with(['country:id,name_ja,name_en,code,geojson_url'])
            ->where('user_id', $userId)
            ->select('id', 'country_id', 'verified_at', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($visited) {
                return [
                    'id' => $visited->id,
                    'country' => $visited->country,
                    'visited_at' => $visited->created_at,
                    'verified_at' => $visited->verified_at,
                ];
            });

        return response()->json($visitedCountries);
    }

    /**
     * ユーザーの訪問済み国コードのリストを取得（地図ハイライト用）
     */
    public function visitedCountryCodes(Request $request)
    {
        $userId = $request->user()->id;

        $countryCodes = VisitedCountry::join('countries', 'visited_countries.country_id', '=', 'countries.id')
            ->where('visited_countries.user_id', $userId)
            ->pluck('countries.code')
            ->toArray();

        return response()->json(['country_codes' => $countryCodes]);
    }
} 