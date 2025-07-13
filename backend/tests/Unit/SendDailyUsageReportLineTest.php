<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Console\Commands\SendDailyUsageReportLine;
use App\Models\User;
use App\Models\UsageHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class SendDailyUsageReportLineTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_stats_calculation(): void
    {
        // テスト用ユーザーを作成
        $yesterday = Carbon::yesterday();
        
        // 昨日作成されたユーザー
        User::factory()->create(['created_at' => $yesterday]);
        User::factory()->create(['created_at' => $yesterday]);
        
        // 今月作成されたユーザー（昨日の2人も含む）
        User::factory()->create(['created_at' => $yesterday->copy()->subDays(5)]);
        
        // プレミアムユーザー
        User::factory()->create(['is_premium' => true]);
        
        $command = new SendDailyUsageReportLine();
        
        // リフレクションを使用してprivateメソッドをテスト
        $reflection = new \ReflectionClass($command);
        $method = $reflection->getMethod('getUserStats');
        $method->setAccessible(true);
        
        $result = $method->invoke($command, $yesterday);
        
        $this->assertEquals(2, $result['daily_new_users']);
        $this->assertEquals(4, $result['monthly_new_users']); // 修正: 昨日の2人 + 5日前の1人 + プレミアムユーザー1人 = 4人
        $this->assertEquals(4, $result['total_users']);
        $this->assertEquals(1, $result['premium_users']);
    }
    
    public function test_feature_name_mapping(): void
    {
        $command = new SendDailyUsageReportLine();
        
        $reflection = new \ReflectionClass($command);
        $method = $reflection->getMethod('getFeatureName');
        $method->setAccessible(true);
        
        $this->assertEquals('🗺️ 旅行プラン生成', $method->invoke($command, 1));
        $this->assertEquals('🏨 宿泊施設検索', $method->invoke($command, 2));
        $this->assertEquals('🎯 観光地レコメンド', $method->invoke($command, 3));
        $this->assertEquals('機能ID: 999', $method->invoke($command, 999));
    }

    public function test_command_handles_empty_data(): void
    {
        // データが空の場合のテスト
        $yesterday = Carbon::yesterday();
        
        $command = new SendDailyUsageReportLine();
        
        $reflection = new \ReflectionClass($command);
        $method = $reflection->getMethod('getUserStats');
        $method->setAccessible(true);
        
        $result = $method->invoke($command, $yesterday);
        
        $this->assertEquals(0, $result['daily_new_users']);
        $this->assertEquals(0, $result['monthly_new_users']);
        $this->assertEquals(0, $result['total_users']);
        $this->assertEquals(0, $result['premium_users']);
    }
}
