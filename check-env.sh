#!/bin/bash

# ==================================================
# Roamory - Environment Variables Check Script
# ==================================================
# 現在の環境変数設定を確認し、SES設定状況を表示します
# ==================================================

echo "🔍 Roamory - Environment Variables Check"
echo "========================================"

# .envファイル存在確認
if [ ! -f .env ]; then
    echo "❌ .env ファイルが見つかりません"
    echo "💡 ./setup-env.sh を実行してセットアップしてください"
    exit 1
fi

echo "✅ .env ファイルが存在します"
echo ""

# Docker Compose 環境変数読み込みテスト
echo "📋 Environment Variables Status:"
echo "================================"

# .envファイルから環境変数を読み込み
source .env

# AWS設定確認
echo "🔐 AWS SES Configuration:"
if [ "$AWS_ACCESS_KEY_ID" = "AKIAIOSFODNN7EXAMPLE" ]; then
    echo "   AWS_ACCESS_KEY_ID: ❌ デフォルト値のまま（要変更）"
else
    echo "   AWS_ACCESS_KEY_ID: ✅ 設定済み (${AWS_ACCESS_KEY_ID:0:8}...)"
fi

if [ "$AWS_SECRET_ACCESS_KEY" = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" ]; then
    echo "   AWS_SECRET_ACCESS_KEY: ❌ デフォルト値のまま（要変更）"
else
    echo "   AWS_SECRET_ACCESS_KEY: ✅ 設定済み (${AWS_SECRET_ACCESS_KEY:0:8}...)"
fi

echo "   AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION:-未設定}"

# メール設定確認
echo ""
echo "📧 Mail Configuration:"
if [ "$MAIL_FROM_ADDRESS" = "your-verified-email@gmail.com" ]; then
    echo "   MAIL_FROM_ADDRESS: ❌ デフォルト値のまま（要変更）"
else
    echo "   MAIL_FROM_ADDRESS: ✅ 設定済み ($MAIL_FROM_ADDRESS)"
fi
echo "   MAIL_FROM_NAME: ${MAIL_FROM_NAME:-未設定}"

# Docker コンテナ状態確認
echo ""
echo "🐳 Docker Container Status:"
if docker-compose ps | grep -q "Up"; then
    echo "   ✅ Docker containers are running"
    
    # コンテナ内環境変数確認
    echo ""
    echo "📦 Container Environment Variables:"
    echo "   (Checking inside backend container...)"
    
    if docker-compose exec backend printenv | grep -E "^(AWS_|MAIL_)" > /dev/null 2>&1; then
        docker-compose exec backend printenv | grep -E "^(AWS_|MAIL_)" | while read line; do
            key=$(echo $line | cut -d'=' -f1)
            value=$(echo $line | cut -d'=' -f2)
            if [[ $key == *"SECRET"* ]] || [[ $key == *"KEY"* ]]; then
                echo "   $key: ${value:0:8}..."
            else
                echo "   $key: $value"
            fi
        done
    else
        echo "   ❌ 環境変数がコンテナに反映されていません"
    fi
else
    echo "   ❌ Docker containers are not running"
    echo "   💡 docker-compose up -d で起動してください"
fi

# 次のステップ
echo ""
echo "📝 Next Steps:"
if [ "$AWS_ACCESS_KEY_ID" = "AKIAIOSFODNN7EXAMPLE" ] || [ "$MAIL_FROM_ADDRESS" = "your-verified-email@gmail.com" ]; then
    echo "1. ❗ .env ファイルを編集して実際の認証情報に変更してください"
    echo "   vi .env  または  nano .env"
    echo "2. docker-compose down && docker-compose up -d で再起動"
    echo "3. ./check-env.sh で再確認"
else
    echo "✅ 設定完了！SESテストを実行してください:"
    echo "   docker-compose exec backend php artisan test:ses-email your-email@gmail.com"
fi

echo ""
echo "🔒 Security Note: .env ファイルは Git 管理対象外です" 