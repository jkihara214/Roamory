<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateTravelPlanRequest extends FormRequest
{
    /**
     * このリクエストの実行を許可するかどうかを決定します。
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // 認証は別途ミドルウェアで処理されるため
    }

    /**
     * リクエストに適用されるバリデーションルール
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'country' => 'required|string',
            'start_date' => 'required|date_format:Y-m-d H:i:s',
            'end_date' => 'required|date_format:Y-m-d H:i:s|after:start_date',
            'budget' => 'required|integer',
            'must_go_places' => 'array',
            'must_go_places.*' => 'string',
        ];
    }

    /**
     * カスタムエラーメッセージ
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'country.required' => '国名は必須です。',
            'country.string' => '国名は文字列で入力してください。',
            'start_date.required' => '入国日時は必須です。',
            'start_date.date_format' => '入国日時は有効な日時で入力してください（形式：YYYY-MM-DD HH:MM:SS）。',
            'end_date.required' => '出国日時は必須です。',
            'end_date.date_format' => '出国日時は有効な日時で入力してください（形式：YYYY-MM-DD HH:MM:SS）。',
            'end_date.after' => '出国日時は入国日時より後の日時を入力してください。',
            'budget.required' => '予算は必須です。',
            'budget.integer' => '予算は整数で入力してください。',
            'must_go_places.array' => '必ず行きたい場所は配列で入力してください。',
            'must_go_places.*.string' => '必ず行きたい場所は文字列で入力してください。',
        ];
    }
} 