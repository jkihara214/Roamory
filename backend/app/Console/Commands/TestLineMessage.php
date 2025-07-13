<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestLineMessage extends Command
{
    protected $signature = 'line:test {message=テストメッセージです}';
    protected $description = 'Test LINE message sending';

    public function handle()
    {
        $accessToken = config('services.line.channel_access_token');
        $adminUserId = config('services.line.admin_user_id');
        
        if (!$accessToken) {
            $this->error('LINE_CHANNEL_ACCESS_TOKEN is not configured in .env file');
            return;
        }
        
        if (!$adminUserId) {
            $this->error('LINE_ADMIN_USER_ID is not configured in .env file');
            return;
        }
        
        $message = $this->argument('message');
        
        $this->info('Sending test message to LINE...');
        $this->info("Access Token: " . substr($accessToken, 0, 10) . "...");
        $this->info("Admin User ID: " . $adminUserId);
        $this->info("Message: " . $message);
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
            'Content-Type' => 'application/json',
        ])->post('https://api.line.me/v2/bot/message/push', [
            'to' => $adminUserId,
            'messages' => [
                [
                    'type' => 'text',
                    'text' => $message
                ]
            ]
        ]);

        if ($response->successful()) {
            $this->info('✅ Test message sent successfully!');
        } else {
            $this->error('❌ Failed to send test message');
            $this->error('HTTP Status: ' . $response->status());
            $this->error('Response: ' . $response->body());
        }
    }
} 