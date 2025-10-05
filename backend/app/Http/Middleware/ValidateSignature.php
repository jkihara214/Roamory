<?php

namespace App\Http\Middleware;

use Illuminate\Routing\Middleware\ValidateSignature as Middleware;
use Closure;

class ValidateSignature extends Middleware
{
    /**
     * The names of the query string parameters that should be ignored.
     *
     * @var array<int, string>
     */
    protected $except = [
        // 'fbclid',
        // 'utm_campaign',
        // 'utm_content',
        // 'utm_medium',
        // 'utm_source',
        // 'utm_term',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, ...$args)
    {
        // 【第1層: signature検証】URL全体の改ざん防止
        // - URL全体（id, hash, expiresを含む）のHMAC署名を検証
        // - 攻撃者がパラメータを変更すると署名が一致せず拒否される
        // - 有効期限（expires）も同時にチェック
        $relative = $args[0] ?? null;
        if ($request->hasValidSignature($relative !== 'relative')) {
            return $next($request);
        }

        // 署名が無効な場合、エラーページにリダイレクト
        if (config('app.env') === 'production') {
            return response('', 302, ['Location' => 'https://roamory.com/auth/email-verification-error/']);
        } else {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect()->away($frontendUrl . '/auth/email-verification-error');
        }
    }
}
