#!/bin/bash

# テスト実行用スクリプト
# このスクリプトは開発環境のデータベースを保護し、
# 確実にインメモリSQLiteデータベースを使用してテストを実行します

echo "🧪 テスト環境でのテスト実行を開始します..."
echo "📊 使用データベース: SQLite インメモリ (:memory:)"
echo "🔒 開発環境のデータは保護されます"
echo ""

# テスト専用の環境変数を設定
export APP_ENV=testing
export APP_KEY=base64:2fl+Ktvkdg+Fuz4Qp/A75G2RTiWVA/ZoKGrfjJx8S6Q=
export DB_CONNECTION=sqlite
export DB_DATABASE=:memory:
export CACHE_DRIVER=array
export SESSION_DRIVER=array
export QUEUE_CONNECTION=sync
export MAIL_MAILER=array
export DB_HOST=""
export DB_PORT=""
export DB_USERNAME=""
export DB_PASSWORD=""

# 追加の安全な設定
export BCRYPT_ROUNDS=4
export PULSE_ENABLED=false
export TELESCOPE_ENABLED=false

# テストを実行
echo "▶️  テスト実行中..."
php artisan test "$@"

# 実行結果を表示
exit_code=$?
if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ テスト完了: すべてのテストが成功しました"
else
    echo ""
    echo "❌ テスト完了: 一部のテストが失敗しました (終了コード: $exit_code)"
fi

exit $exit_code 