<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        // $notifiable は Laravel の通知システムで必要なパラメータ
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        // 本番環境では url() を使用、開発環境では FRONTEND_URL を使用
        if (config('app.env') === 'production') {
            $loginUrl = url('/login');
        } else {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $loginUrl = $frontendUrl . '/login';
        }
        $changedAt = now()->format('Y年m月d日 H:i');

        return (new MailMessage)
            ->subject('【Roamory】パスワード変更完了のお知らせ')
            ->greeting('こんにちは、' . $notifiable->name . 'さん')
            ->line('あなたのアカウントのパスワードが正常に変更されました。')
            ->line('変更日時: ' . $changedAt)
            ->line('この変更に心当たりがない場合は、直ちに以下の対応を行ってください：')
            ->line('1. 下記のボタンから新しいパスワードでログインし、再度パスワードを変更してください。')
            ->line('2. 不正アクセスの可能性がある場合は、サポートまでご連絡ください。')
            ->action('ログイン画面へ', $loginUrl)
            ->line('セキュリティのため、定期的なパスワード変更をお勧めします。')
            ->salutation('Roamory サポートチーム');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        // $notifiable は Laravel の通知システムで必要なパラメータ
        return [
            'message' => 'パスワードが変更されました',
            'changed_at' => now()->toISOString(),
        ];
    }
}