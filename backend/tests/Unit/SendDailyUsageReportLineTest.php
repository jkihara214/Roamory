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
        
        // 今月作成されたユーザー（昨日の2人も含む）- 昨日と同じ月の15日
        $midMonth = $yesterday->copy()->day(15);
        // 昨日が15日の場合は10日を使用
        if ($yesterday->day === 15) {
            $midMonth = $yesterday->copy()->day(10);
        }
        User::factory()->create(['created_at' => $midMonth]);
        
        // プレミアムユーザー（今月作成）- 昨日と同じ月の5日（どの月でも確実に存在）
        $earlyMonth = $yesterday->copy()->day(5);
        // 昨日が5日の場合は12日を使用
        if ($yesterday->day === 5) {
            $earlyMonth = $yesterday->copy()->day(12);
        }
        User::factory()->create(['is_premium' => true, 'created_at' => $earlyMonth]);
        
        $command = new SendDailyUsageReportLine();
        
        // リフレクションを使用してprivateメソッドをテスト
        $reflection = new \ReflectionClass($command);
        $method = $reflection->getMethod('getUserStats');
        $method->setAccessible(true);
        
        $result = $method->invoke($command, $yesterday);
        
        $this->assertEquals(2, $result['daily_new_users']);
        $this->assertEquals(4, $result['monthly_new_users']); // 修正: 昨日の2人 + 今月15日の1人 + 今月5日のプレミアムユーザー1人 = 4人
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
