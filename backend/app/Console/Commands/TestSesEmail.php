<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class TestSesEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:ses-email {to} {--from=} {--aws-key=} {--aws-secret=} {--aws-region=ap-northeast-1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test AWS SES email sending for Roamory user registration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $to = $this->argument('to');
        $from = $this->option('from') ?? 'noreply@roamory.com';
        $awsKey = $this->option('aws-key');
        $awsSecret = $this->option('aws-secret');
        $awsRegion = $this->option('aws-region');

        $this->info('🚀 Testing AWS SES email sending for Roamory...');
        $this->info("From: {$from}");
        $this->info("To: {$to}");
        $this->info("AWS Region: {$awsRegion}");

        // 動的にAWS設定を更新
        if ($awsKey && $awsSecret) {
            Config::set('services.ses.key', $awsKey);
            Config::set('services.ses.secret', $awsSecret);
            Config::set('services.ses.region', $awsRegion);
            Config::set('mail.from.address', $from);
            Config::set('mail.from.name', 'Roamory');
            Config::set('mail.default', 'ses');
            
            $this->info('✅ AWS SES settings configured dynamically');
        } else {
            $this->warn('⚠️  Using default AWS settings from .env file');
        }

        try {
            // テストメール送信
            Mail::raw($this->getTestEmailContent(), function ($message) use ($to, $from) {
                $message->to($to)
                        ->subject('🌍 Roamory - メール認証テスト')
                        ->from($from, 'Roamory');
            });

            $this->info('✅ Test email sent successfully!');
            $this->info('📧 Please check your inbox: ' . $to);
            
            // 送信統計の表示
            $this->showSesStats();
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to send test email');
            $this->error('Error: ' . $e->getMessage());
            
            // トラブルシューティング情報
            $this->showTroubleshootingInfo();
        }

        return 0;
    }

    /**
     * テストメールの内容を取得
     */
    private function getTestEmailContent(): string
    {
        return "
🌍 Roamory - メール認証テスト

こんにちは！

これはRoamoryアプリケーションのAWS SESメール送信テストです。

このメールが正常に受信できている場合、以下の機能が正常に動作します：
✅ ユーザー登録時のメール認証
✅ パスワードリセット機能（今後実装予定）
✅ システム通知メール

---
送信時刻: " . now()->format('Y-m-d H:i:s') . "
送信元: AWS SES
リージョン: " . config('services.ses.region') . "

Roamory開発チーム
        ";
    }

    /**
     * SES送信統計を表示
     */
    private function showSesStats(): void
    {
        $this->info('');
        $this->info('📊 Current SES Configuration:');
        $this->table(
            ['Setting', 'Value'],
            [
                ['MAIL_MAILER', config('mail.default')],
                ['MAIL_FROM_ADDRESS', config('mail.from.address')],
                ['MAIL_FROM_NAME', config('mail.from.name')],
                ['AWS_REGION', config('services.ses.region')],
                ['AWS_ACCESS_KEY_ID', substr(config('services.ses.key'), 0, 8) . '...'],
            ]
        );
    }

    /**
     * トラブルシューティング情報を表示
     */
    private function showTroubleshootingInfo(): void
    {
        $this->info('');
        $this->warn('🔧 Troubleshooting Information:');
        
        $this->info('📋 Common Issues & Solutions:');
        $this->info('1. ❌ Invalid AWS credentials');
        $this->info('   → Check Access Key ID and Secret Access Key');
        $this->info('');
        $this->info('2. ❌ Email address not verified');
        $this->info('   → Go to AWS SES Console > Verified identities');
        $this->info('   → Verify both sender and recipient emails');
        $this->info('');
        $this->info('3. ❌ Sandbox restrictions (current status)');
        $this->info('   → Can only send between verified email addresses');
        $this->info('   → Daily limit: 200 emails, Rate: 1 email/second');
        $this->info('   → Apply for production access to remove restrictions');
        $this->info('');
        $this->info('4. ❌ Wrong AWS region');
        $this->info('   → Ensure region matches your SES setup');
        $this->info('   → Use --aws-region=ap-northeast-1 for Tokyo');
        
        $this->info('');
        $this->info('🎯 Recommended Test Steps:');
        $this->info('Step 1: Test with your own verified email address');
        $this->info('php artisan test:ses-email your-email@gmail.com \\');
        $this->info('  --aws-key=AKIA... \\');
        $this->info('  --aws-secret=xxx... \\');
        $this->info('  --from=your-email@gmail.com');
        
        $this->info('');
        $this->info('📞 Need Help? Check:');
        $this->info('- AWS SES Console: https://console.aws.amazon.com/ses/');
        $this->info('- Verification Status: Identities > Email addresses');
        $this->info('- Sending Statistics: Account dashboard');
    }
}
