<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailJapanese extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('【Roamory】メールアドレスの認証をお願いします')
            ->greeting('こんにちは！')
            ->line('Roamoryへのご登録ありがとうございます。')
            ->line('メールアドレスの認証を完了するため、下記のボタンをクリックしてください。')
            ->action('メールアドレスを認証する', $verificationUrl)
            ->line('このメール認証リンクは24時間後に期限切れになります。')
            ->line('')
            ->line('もしアカウント作成に心当たりがない場合は、このメールを無視してください。')
            ->line('')
            ->salutation('Roamoryチーム');
    }

    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
} 