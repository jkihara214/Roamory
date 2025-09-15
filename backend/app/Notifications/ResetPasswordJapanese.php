<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordJapanese extends ResetPassword
{
    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        // 有効期限を計算（現在時刻 + 60分）
        $expiresAt = now()->addMinutes(config('auth.passwords.users.expire', 60));
        $expiresAtFormatted = $expiresAt->format('Y年m月d日 H:i');

        return (new MailMessage)
            ->subject('【Roamory】パスワードリセットのお知らせ')
            ->greeting('こんにちは、' . $notifiable->name . 'さん')
            ->line('パスワードリセットのリクエストを受け付けました。')
            ->line('以下のボタンをクリックしてパスワードをリセットしてください。')
            ->action('パスワードをリセット', $resetUrl)
            ->line('このリンクは' . $expiresAtFormatted . 'まで有効です（60分間）。')
            ->line('有効期限を過ぎた場合は、再度パスワードリセットをリクエストしてください。')
            ->line('心当たりがない場合は、このメールを無視してください。')
            ->salutation('Roamory サポートチーム');
    }
}