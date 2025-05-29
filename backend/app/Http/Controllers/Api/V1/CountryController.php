<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index()
    {
        // 必要なカラムのみ返す
        $countries = Country::select('id', 'name_ja', 'name_en', 'code', 'geojson_url')->get();
        return response()->json($countries);
    }
} 