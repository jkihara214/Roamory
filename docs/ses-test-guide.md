# AWS SES テスト実行手順書

## 🎯 **テストの目的**

-   AWS SES メール送信機能の動作確認
-   ユーザー登録時のメール認証機能のテスト
-   本番環境への移行準備

---

## 📋 **事前準備チェックリスト**

### ✅ **必須条件**

-   [ ] AWS SES で DKIM 認証完了済み
-   [ ] 本番アクセス申請済み（承認待ち可）
-   [ ] 検証済みメールアドレス（Gmail 等）
-   [ ] Roamory 専用 IAM ユーザー作成済み

### 📝 **準備する情報**

```
1. 検証済みメールアドレス: ________________
2. AWS Access Key ID: AKIA________________
3. AWS Secret Access Key: ________________
4. AWS Region: ap-northeast-1（東京）
```

---

## 🚀 **テスト実行手順**

### **Phase 1: 基本接続テスト**

#### 1.1 Docker コンテナに接続

```bash
# Roamoryプロジェクトのルートディレクトリで実行
docker-compose exec backend bash
```

#### 1.2 AWS SDK for PHP インストール確認

```bash
composer show aws/aws-sdk-php
# インストール済みであることを確認
```

#### 1.3 基本テスト実行

```bash
php artisan test:ses-email your-email@gmail.com \
  --aws-key=AKIA... \
  --aws-secret=xxx... \
  --from=your-email@gmail.com \
  --aws-region=ap-northeast-1
```

**期待する結果**:

```
🚀 Testing AWS SES email sending for Roamory...
From: your-email@gmail.com
To: your-email@gmail.com
AWS Region: ap-northeast-1
✅ AWS SES settings configured dynamically
✅ Test email sent successfully!
📧 Please check your inbox: your-email@gmail.com
```

### **Phase 2: 異なる送信先テスト**

#### 2.1 同じ検証済みアドレスで異なる送信パターン

```bash
# パターン1: 同じアドレスから同じアドレスへ
php artisan test:ses-email your-email@gmail.com \
  --from=your-email@gmail.com \
  --aws-key=AKIA... \
  --aws-secret=xxx...

# パターン2: 複数の検証済みアドレス間（複数持っている場合）
php artisan test:ses-email another-verified@gmail.com \
  --from=your-email@gmail.com \
  --aws-key=AKIA... \
  --aws-secret=xxx...
```

### **Phase 3: エラーケステスト**

#### 3.1 未検証アドレステスト（エラー確認）

```bash
# 意図的にエラーを発生させて動作確認
php artisan test:ses-email unverified@example.com \
  --from=your-email@gmail.com \
  --aws-key=AKIA... \
  --aws-secret=xxx...
```

**期待するエラー**:

```
❌ Failed to send test email
Error: Email address not verified...
```

---

## 📊 **結果の確認方法**

### **メール受信確認**

-   [ ] テストメールが受信ボックスに到着
-   [ ] 件名: "🌍 Roamory - メール認証テスト"
-   [ ] 送信者: 指定した送信元アドレス
-   [ ] 内容: Roamory テストメッセージ

### **AWS SES コンソール確認**

```
AWS SES Console > Monitoring > Account dashboard
```

-   [ ] 送信統計の増加
-   [ ] Bounce/Complaint なし
-   [ ] 送信制限内での送信

---

## 🔧 **トラブルシューティング**

### **よくあるエラーとその対処法**

#### ❌ **"Email address not verified"**

```
対処法:
1. AWS SES Console > Verified identities
2. 送信元・送信先両方のメールアドレスが検証済みか確認
3. 未検証の場合、検証メールを送信して承認
```

#### ❌ **"Invalid AWS credentials"**

```
対処法:
1. Access Key IDとSecret Access Keyの確認
2. IAMユーザーのSES権限確認
3. 新しいアクセスキーの生成
```

#### ❌ **"Region not supported"**

```
対処法:
1. --aws-region=ap-northeast-1 を明示的に指定
2. AWS SESの設定リージョンと一致確認
```

#### ❌ **"Sending quota exceeded"**

```
対処法:
1. サンドボックス制限（1日200通）の確認
2. 本番アクセス申請の状況確認
3. 24時間後の再テスト
```

---

## 📈 **次のステップ**

### **テスト成功後**

-   [ ] .env.prod ファイルの設定更新
-   [ ] 本番アクセス申請の承認確認
-   [ ] 実際のユーザー登録機能テスト
-   [ ] メール認証フロー全体のテスト

### **本番環境設定**

```env
# backend/.env.prod
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx...
AWS_DEFAULT_REGION=ap-northeast-1
MAIL_FROM_ADDRESS="noreply@roamory.com"
MAIL_FROM_NAME="Roamory"
```

---

## 📞 **サポート情報**

### **参考リンク**

-   [AWS SES コンソール](https://console.aws.amazon.com/ses/)
-   [AWS SES ドキュメント](https://docs.aws.amazon.com/ses/)
-   [Laravel SES 設定](https://laravel.com/docs/mail#ses-driver)

### **問題が解決しない場合**

1. AWS サポートへの問い合わせ
2. Laravel コミュニティフォーラム
3. 開発チームへの報告（ログ・エラーメッセージ含む）
