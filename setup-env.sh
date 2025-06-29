#!/bin/bash

# ==================================================
# Roamory - AWS SES Environment Setup Script
# ==================================================
# このスクリプトは .env ファイルを作成し、
# AWS SES 設定を簡単にセットアップします
# ==================================================

echo "🚀 Roamory - AWS SES Environment Setup"
echo "======================================"

# 既存の.envファイルチェック
if [ -f .env ]; then
    echo "⚠️  .env ファイルが既に存在します"
    read -p "上書きしますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ セットアップをキャンセルしました"
        exit 1
    fi
fi

# .envファイル作成
cat > .env << 'EOF'
# AWS SES 認証情報
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=ap-northeast-1

# メール送信設定
MAIL_FROM_ADDRESS=your-verified-email@gmail.com
MAIL_FROM_NAME=Roamory

# ==================================================
# 次のステップ:
# 1. .env ファイルを編集して実際の認証情報に変更
# 2. docker-compose down && docker-compose up -d で再起動
# 3. php artisan test:ses-email your-email@gmail.com でテスト
# ==================================================
EOF

echo "✅ .env ファイルが作成されました"
echo ""
echo "📝 次のステップ:"
echo "1. .env ファイルを編集してください:"
echo "   vi .env  または  nano .env"
echo ""
echo "2. 以下の値を実際の認証情報に変更してください:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - MAIL_FROM_ADDRESS"
echo ""
echo "3. Docker コンテナを再起動してください:"
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "4. SES テストを実行してください:"
echo "   docker-compose exec backend php artisan test:ses-email your-email@gmail.com"
echo ""
echo "🔒 セキュリティ: .env ファイルは .gitignore により Git 管理対象外です" 