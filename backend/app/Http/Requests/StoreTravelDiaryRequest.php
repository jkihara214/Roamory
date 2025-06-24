<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTravelDiaryRequest extends FormRequest
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
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:10000',
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
            'latitude.required' => '緯度は必須です。',
            'latitude.numeric' => '緯度は数値で入力してください。',
            'latitude.between' => '緯度は-90から90の間で入力してください。',
            'longitude.required' => '経度は必須です。',
            'longitude.numeric' => '経度は数値で入力してください。',
            'longitude.between' => '経度は-180から180の間で入力してください。',
            'title.required' => 'タイトルは必須です。',
            'title.string' => 'タイトルは文字列で入力してください。',
            'title.max' => 'タイトルは255文字以内で入力してください。',
            'content.required' => '内容は必須です。',
            'content.string' => '内容は文字列で入力してください。',
            'content.max' => '内容は10000文字以内で入力してください。',
        ];
    }
} 