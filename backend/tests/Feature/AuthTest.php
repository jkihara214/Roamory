<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Notifications\VerifyEmail;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_success()
    {
        Notification::fake();
        
        $response = $this->postJson('/api/v1/register', [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message'])
            ->assertJsonMissing(['user', 'token']); // トークンは返されない
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        
        // メール認証通知が送信されたことを確認
        $user = User::where('email', 'test@example.com')->first();
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_register_validation_error()
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);
        $response->assertStatus(422);
    }

    public function test_login_success_with_verified_email()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token', 'email_verified']);
    }

    public function test_login_fail_with_unverified_email()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => null, // 未認証
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'メールアドレスの認証が完了していません。認証メールを確認してください。',
                'email_verified' => false,
            ]);
    }

    public function test_login_fail()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_rate_limiting()
    {
        // キャッシュをクリア
        Cache::flush();
        
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        // 5回連続でログイン失敗
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);
            $response->assertStatus(401);
        }

        // 6回目はレート制限により429エラー
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);
        $response->assertStatus(429)
            ->assertJson(['message' => 'ログイン試行回数が上限に達しました。15分後に再試行してください。']);

        // 正しいパスワードでも制限される
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);
        $response->assertStatus(429);
    }

    public function test_login_rate_limiting_reset_on_success()
    {
        // キャッシュをクリア
        Cache::flush();
        
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        // 4回連続でログイン失敗
        for ($i = 0; $i < 4; $i++) {
            $response = $this->postJson('/api/v1/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);
            $response->assertStatus(401);
        }

        // 5回目で成功
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);
        $response->assertStatus(200);

        // 成功後は試行回数がリセットされるため、再度失敗しても制限されない
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);
        $response->assertStatus(401); // 429ではなく401
    }

    public function test_email_verification()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => null,
        ]);

        // 認証リンクを生成
        $hash = sha1($user->email);

        $response = $this->get("/api/v1/email/verify/{$user->id}/{$hash}");

        // リダイレクトレスポンスを期待
        $response->assertStatus(302)
            ->assertRedirect('http://localhost:3000/email-verification?status=success&email=' . urlencode($user->email));

        // データベースで認証済みになっていることを確認
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_invalid_hash()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => null,
        ]);

        $response = $this->get("/api/v1/email/verify/{$user->id}/invalid-hash");

        // リダイレクトレスポンスを期待
        $response->assertStatus(302)
            ->assertRedirect('http://localhost:3000/email-verification?status=invalid');
    }

    public function test_email_verification_already_verified()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => now(),
        ]);

        $hash = sha1($user->email);

        $response = $this->get("/api/v1/email/verify/{$user->id}/{$hash}");

        // リダイレクトレスポンスを期待
        $response->assertStatus(302)
            ->assertRedirect('http://localhost:3000/email-verification?status=already_verified&email=' . urlencode($user->email));
    }

    public function test_resend_verification_email_for_unverified_user()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/v1/email/resend-unverified', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => '認証メールを再送信しました。']);

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_resend_verification_email_for_nonexistent_user()
    {
        $response = $this->postJson('/api/v1/email/resend-unverified', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(404)
            ->assertJson(['message' => '指定されたメールアドレスのユーザーが見つかりません。']);
    }

    public function test_resend_verification_email_for_already_verified_user()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/email/resend-unverified', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'メールアドレスは既に認証済みです。']);
    }

    public function test_check_email_verification_status()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/email/verification-status');

        $response->assertStatus(200)
            ->assertJson(['email_verified' => true]);
    }

    public function test_me_success()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/me');

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'email', 'email_verified_at', 'email_verified']);
    }

    public function test_me_unauthenticated()
    {
        $response = $this->getJson('/api/v1/me');
        $response->assertStatus(401);
    }

    public function test_logout_success()
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'ログアウトしました']);
    }

    public function test_logout_unauthenticated()
    {
        $response = $this->postJson('/api/v1/logout');
        $response->assertStatus(401);
    }
} 