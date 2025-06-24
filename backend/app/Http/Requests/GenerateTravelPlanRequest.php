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
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
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
            'start_date.required' => '開始日は必須です。',
            'start_date.date' => '開始日は有効な日付で入力してください。',
            'end_date.required' => '終了日は必須です。',
            'end_date.date' => '終了日は有効な日付で入力してください。',
            'end_date.after_or_equal' => '終了日は開始日以降の日付を入力してください。',
            'budget.required' => '予算は必須です。',
            'budget.integer' => '予算は整数で入力してください。',
            'must_go_places.array' => '必ず行きたい場所は配列で入力してください。',
            'must_go_places.*.string' => '必ず行きたい場所は文字列で入力してください。',
        ];
    }
} 