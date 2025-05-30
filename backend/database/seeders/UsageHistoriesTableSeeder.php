<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UsageHistory;
use Carbon\Carbon;

class UsageHistoriesTableSeeder extends Seeder
{
    public function run(): void
    {
        // 例: user_id=1, feature_id=1 の履歴を4件作成
        for ($i = 0; $i < 4; $i++) {
            UsageHistory::create([
                'user_id' => 1,
                'feature_id' => 1,
                'created_at' => Carbon::now()->subHours($i),
                'updated_at' => Carbon::now()->subHours($i),
            ]);
        }
    }
} 