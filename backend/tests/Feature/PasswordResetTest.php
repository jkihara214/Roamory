<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ResetPasswordJapanese;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_password_reset_email()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'メールアドレスが登録されている場合、パスワードリセットメールを送信しました。',
            ]);

        Notification::assertSentTo($user, ResetPasswordJapanese::class);
    }

    public function test_forgot_password_with_nonexistent_email()
    {
        Notification::fake();
        
        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        // 存在しないメールアドレスでも同じレスポンスを返す（セキュリティ対策）
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'メールアドレスが登録されている場合、パスワードリセットメールを送信しました。',
            ]);
        
        // メールは送信されないことを確認
        Notification::assertNothingSent();
    }

    public function test_forgot_password_with_invalid_email_format()
    {
        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'invalid-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_reset_password_success()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'NewPass123',  // 英字と数字を含む
            'password_confirmation' => 'NewPass123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'パスワードがリセットされました。',
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check('NewPass123', $user->password));
    }

    public function test_reset_password_with_invalid_token()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/v1/reset-password', [
            'token' => 'invalid-token',
            'email' => 'test@example.com',
            'password' => 'NewPass123',  // 英字と数字を含む
            'password_confirmation' => 'NewPass123',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'パスワードリセットトークンが無効です。',
            ]);
    }

    public function test_reset_password_with_mismatched_confirmation()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'NewPass123',  // 英字と数字を含む
            'password_confirmation' => 'DifferentPass123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'errors' => [
                    'password' => ['パスワードが一致しません。']
                ]
            ]);
    }

    public function test_reset_password_with_short_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'Pass1',  // 5文字
            'password_confirmation' => 'Pass1',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'errors' => [
                    'password' => ['パスワードは8文字以上で入力してください。']
                ]
            ]);
    }

    public function test_reset_password_with_long_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'Password123456789012345',  // 21文字
            'password_confirmation' => 'Password123456789012345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'errors' => [
                    'password' => ['パスワードは20文字以内で入力してください。']
                ]
            ]);
    }

    public function test_reset_password_without_letter()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => '12345678',  // 数字のみ
            'password_confirmation' => '12345678',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'errors' => [
                    'password' => ['パスワードは英字と数字の両方を含む必要があります。']
                ]
            ]);
    }

    public function test_reset_password_without_number()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'Password',  // 英字のみ
            'password_confirmation' => 'Password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'errors' => [
                    'password' => ['パスワードは英字と数字の両方を含む必要があります。']
                ]
            ]);
    }
}