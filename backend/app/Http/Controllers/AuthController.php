<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;
use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResendVerificationEmailRequest;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        // メール認証通知を送信
        event(new Registered($user));

        return response()->json([
            'message' => 'アカウントが作成されました。認証メールを確認してからログインしてください。',
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        // ログイン試行回数制限（IPアドレスベース）
        $key = 'login_attempts_' . $request->ip();
        $attempts = Cache::get($key, 0);
        $maxAttempts = 5; // 最大試行回数
        $lockoutTime = 900; // ロックアウト時間（15分 = 900秒）

        if ($attempts >= $maxAttempts) {
            return response()->json([
                'message' => 'ログイン試行回数が上限に達しました。15分後に再試行してください。'
            ], 429);
        }

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            // 試行回数をインクリメント
            Cache::put($key, $attempts + 1, $lockoutTime);
            
            return response()->json([
                'message' => '認証情報が正しくありません'
            ], 401);
        }

        // メール認証済みかどうかをチェック
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'メールアドレスの認証が完了していません。認証メールを確認してください。',
                'email_verified' => false,
            ], 403);
        }

        // ログイン成功時は試行回数をリセット
        Cache::forget($key);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'email_verified' => $user->hasVerifiedEmail(),
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'email_verified' => $user->hasVerifiedEmail(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'ログアウトしました']);
    }

    /**
     * メール認証の確認
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $frontendUrl = env("FRONTEND_URL", "http://localhost:3000");
        
        try {
            $user = User::findOrFail($id);

            // ハッシュの検証
            if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
                return redirect($frontendUrl . "/email-verification?status=invalid");
            }

            // 既に認証済みの場合
            if ($user->hasVerifiedEmail()) {
                return redirect($frontendUrl . "/email-verification?status=already_verified&email=" . urlencode($user->email));
            }

            // メール認証を完了
            if ($user->markEmailAsVerified()) {
                return redirect($frontendUrl . "/email-verification?status=success&email=" . urlencode($user->email));
            }

            return redirect($frontendUrl . "/email-verification?status=error");
            
        } catch (\Exception $e) {
            return redirect($frontendUrl . "/email-verification?status=error");
        }
    }

    /**
     * メール認証の再送信（未認証ユーザー向け）
     */
    public function resendVerificationEmailForUnverified(ResendVerificationEmailRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'message' => '指定されたメールアドレスのユーザーが見つかりません。',
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'メールアドレスは既に認証済みです。',
            ]);
        }

        // 再送信の制限（5分間隔）
        $key = 'resend_verification_' . $user->id;
        if (Cache::has($key)) {
            return response()->json([
                'message' => '認証メールの再送信は5分間隔で行えます。',
            ], 429);
        }

        $user->sendEmailVerificationNotification();

        // 5分間の制限を設定
        Cache::put($key, true, 300);

        return response()->json([
            'message' => '認証メールを再送信しました。',
        ]);
    }

    /**
     * メール認証の再送信
     */
    public function resendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'メールアドレスは既に認証済みです。'
            ]);
        }

        // 再送信の制限（5分間隔）
        $key = 'resend_verification_' . $user->id;
        if (Cache::has($key)) {
            return response()->json([
                'message' => '認証メールの再送信は5分間隔で行えます。'
            ], 429);
        }

        $user->sendEmailVerificationNotification();

        // 5分間の制限を設定
        Cache::put($key, true, 300);

        return response()->json([
            'message' => '認証メールを再送信しました。'
        ]);
    }

    /**
     * メール認証状態の確認
     */
    public function checkEmailVerification(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'email_verified' => $user->hasVerifiedEmail(),
            'email_verified_at' => $user->email_verified_at,
        ]);
    }
} 