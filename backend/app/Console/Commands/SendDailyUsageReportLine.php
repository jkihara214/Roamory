<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UsageHistory;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class SendDailyUsageReportLine extends Command
{
    protected $signature = 'usage:daily-report-line';
    protected $description = 'Send daily AI usage report and user statistics to LINE';

    public function handle()
    {
        $yesterday = Carbon::yesterday();
        
        // 前日の利用統計を取得
        $dailyUsage = UsageHistory::whereDate('created_at', $yesterday)
            ->selectRaw('COUNT(*) as total_requests, COUNT(DISTINCT user_id) as unique_users')
            ->first();
        
        // 機能別の利用統計
        $featureUsage = UsageHistory::whereDate('created_at', $yesterday)
            ->selectRaw('feature_id, COUNT(*) as count')
            ->groupBy('feature_id')
            ->get();
        
        // 今月の累計統計
        $monthlyUsage = UsageHistory::whereMonth('created_at', $yesterday->month)
            ->whereYear('created_at', $yesterday->year)
            ->selectRaw('COUNT(*) as total_requests, COUNT(DISTINCT user_id) as unique_users')
            ->first();
        
        // ユーザー作成統計を取得
        $userStats = $this->getUserStats($yesterday);
        
        // メッセージを作成
        $messages = $this->buildLineMessages($yesterday->format('Y-m-d'), $dailyUsage, $featureUsage, $monthlyUsage, $userStats);
        
        // LINEに送信
        $this->sendToLine($messages);
        
        $this->info('Daily usage report and user statistics sent to LINE successfully!');
    }

    private function getUserStats($yesterday)
    {
        // 昨日の新規ユーザー数
        $dailyNewUsers = User::whereDate('created_at', $yesterday)->count();
        
        // 今月の新規ユーザー数
        $monthlyNewUsers = User::whereMonth('created_at', $yesterday->month)
            ->whereYear('created_at', $yesterday->year)
            ->count();
        
        // 総ユーザー数
        $totalUsers = User::count();
        
        // プレミアムユーザー数
        $premiumUsers = User::where('is_premium', true)->count();
        
        return [
            'daily_new_users' => $dailyNewUsers,
            'monthly_new_users' => $monthlyNewUsers,
            'total_users' => $totalUsers,
            'premium_users' => $premiumUsers,
        ];
    }

    private function buildLineMessages($date, $dailyUsage, $featureUsage, $monthlyUsage, $userStats)
    {
        // LINE Messaging APIではFlexメッセージを使用してリッチなUIを作成
        return [
            [
                'type' => 'flex',
                'altText' => "日次レポート - {$date}",
                'contents' => [
                    'type' => 'bubble',
                    'header' => [
                        'type' => 'box',
                        'layout' => 'vertical',
                        'contents' => [
                            [
                                'type' => 'text',
                                'text' => '📊 Roamory 日次レポート',
                                'weight' => 'bold',
                                'size' => 'xl',
                                'color' => '#1DB446'
                            ],
                            [
                                'type' => 'text',
                                'text' => $date,
                                'size' => 'sm',
                                'color' => '#666666'
                            ]
                        ]
                    ],
                    'body' => [
                        'type' => 'box',
                        'layout' => 'vertical',
                        'spacing' => 'md',
                        'contents' => [
                            // AI利用統計セクション
                            [
                                'type' => 'text',
                                'text' => '🤖 AI利用統計',
                                'weight' => 'bold',
                                'size' => 'lg',
                                'color' => '#1DB446'
                            ],
                            // 昨日の利用状況
                            [
                                'type' => 'box',
                                'layout' => 'vertical',
                                'spacing' => 'sm',
                                'contents' => [
                                    [
                                        'type' => 'text',
                                        'text' => '昨日の状況',
                                        'weight' => 'bold',
                                        'size' => 'md'
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => 'リクエスト数',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$dailyUsage->total_requests}回",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#1DB446',
                                                'flex' => 2
                                            ]
                                        ]
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => '利用ユーザー数',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$dailyUsage->unique_users}人",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#1DB446',
                                                'flex' => 2
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            // 今月の累計
                            [
                                'type' => 'box',
                                'layout' => 'vertical',
                                'spacing' => 'sm',
                                'contents' => [
                                    [
                                        'type' => 'text',
                                        'text' => '今月の累計',
                                        'weight' => 'bold',
                                        'size' => 'md'
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => 'リクエスト数',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$monthlyUsage->total_requests}回",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#0066CC',
                                                'flex' => 2
                                            ]
                                        ]
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => '利用ユーザー数',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$monthlyUsage->unique_users}人",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#0066CC',
                                                'flex' => 2
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            // 機能別利用状況
                            [
                                'type' => 'box',
                                'layout' => 'vertical',
                                'spacing' => 'sm',
                                'contents' => array_merge(
                                    [
                                        [
                                            'type' => 'text',
                                            'text' => '機能別（昨日）',
                                            'weight' => 'bold',
                                            'size' => 'md'
                                        ]
                                    ],
                                    $this->buildFeatureUsageContents($featureUsage)
                                )
                            ],
                            [
                                'type' => 'separator'
                            ],
                            // ユーザー統計セクション
                            [
                                'type' => 'text',
                                'text' => '👥 ユーザー統計',
                                'weight' => 'bold',
                                'size' => 'lg',
                                'color' => '#FF6B35'
                            ],
                            // 昨日の状況
                            [
                                'type' => 'box',
                                'layout' => 'vertical',
                                'spacing' => 'sm',
                                'contents' => [
                                    [
                                        'type' => 'text',
                                        'text' => '昨日の状況',
                                        'weight' => 'bold',
                                        'size' => 'md'
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => '新規登録数',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$userStats['daily_new_users']}人",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#FF6B35',
                                                'flex' => 2
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            // 今月の累計
                            [
                                'type' => 'box',
                                'layout' => 'vertical',
                                'spacing' => 'sm',
                                'contents' => [
                                    [
                                        'type' => 'text',
                                        'text' => '今月の累計',
                                        'weight' => 'bold',
                                        'size' => 'md'
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => '新規登録数',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$userStats['monthly_new_users']}人",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#0066CC',
                                                'flex' => 2
                                            ]
                                        ]
                                    ]
                                ]
                            ],
                            // 全体の累計
                            [
                                'type' => 'box',
                                'layout' => 'vertical',
                                'spacing' => 'sm',
                                'contents' => [
                                    [
                                        'type' => 'text',
                                        'text' => '全体の累計',
                                        'weight' => 'bold',
                                        'size' => 'md'
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => '総ユーザー数',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$userStats['total_users']}人",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#9B59B6',
                                                'flex' => 2
                                            ]
                                        ]
                                    ],
                                    [
                                        'type' => 'box',
                                        'layout' => 'baseline',
                                        'spacing' => 'sm',
                                        'contents' => [
                                            [
                                                'type' => 'text',
                                                'text' => 'プレミアムユーザー',
                                                'color' => '#666666',
                                                'size' => 'sm',
                                                'flex' => 3
                                            ],
                                            [
                                                'type' => 'text',
                                                'text' => "{$userStats['premium_users']}人",
                                                'weight' => 'bold',
                                                'size' => 'sm',
                                                'color' => '#F39C12',
                                                'flex' => 2
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'footer' => [
                        'type' => 'box',
                        'layout' => 'vertical',
                        'spacing' => 'sm',
                        'contents' => [
                            [
                                'type' => 'text',
                                'text' => 'Roamory システム',
                                'size' => 'xs',
                                'color' => '#999999',
                                'align' => 'center'
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    private function buildFeatureUsageContents($featureUsage)
    {
        if ($featureUsage->isEmpty()) {
            return [
                [
                    'type' => 'text',
                    'text' => '利用なし',
                    'color' => '#666666',
                    'size' => 'sm'
                ]
            ];
        }

        $contents = [];
        foreach ($featureUsage as $feature) {
            $featureName = $this->getFeatureName($feature->feature_id);
            $contents[] = [
                'type' => 'box',
                'layout' => 'baseline',
                'spacing' => 'sm',
                'contents' => [
                    [
                        'type' => 'text',
                        'text' => $featureName,
                        'color' => '#666666',
                        'size' => 'sm',
                        'flex' => 3
                    ],
                    [
                        'type' => 'text',
                        'text' => "{$feature->count}回",
                        'weight' => 'bold',
                        'size' => 'sm',
                        'color' => '#1DB446',
                        'flex' => 2
                    ]
                ]
            ];
        }

        return $contents;
    }

    private function getFeatureName($featureId)
    {
        return match($featureId) {
            1 => '🗺️ 旅行プラン生成',
            2 => '🏨 宿泊施設検索',
            3 => '🎯 観光地レコメンド',
            default => "機能ID: {$featureId}"
        };
    }

    private function sendToLine($messages)
    {
        $accessToken = config('services.line.channel_access_token');
        $adminUserId = config('services.line.admin_user_id');
        
        if (!$accessToken || !$adminUserId) {
            $this->error('LINE channel access token or admin user ID not configured');
            return;
        }
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
            'Content-Type' => 'application/json',
        ])->post('https://api.line.me/v2/bot/message/push', [
            'to' => $adminUserId,
            'messages' => $messages
        ]);

        if (!$response->successful()) {
            $this->error('Failed to send LINE message: ' . $response->body());
            return;
        }

        $this->info('LINE message sent successfully');
    }
}
