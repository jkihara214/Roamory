# Roamory AWS IAM 設定手順書

## 1. IAM ポリシーの作成（SES 専用）

### 1.1 AWS Management Console にログイン

-   ルートユーザーまたは管理者権限でログイン

### 1.2 IAM ポリシーの作成

```
AWS Management Console > IAM > Policies > Create Policy
```

**ポリシー内容（JSON）**:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "RoamorySESAccess",
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:GetSendQuota",
                "ses:GetSendStatistics"
            ],
            "Resource": "*"
        }
    ]
}
```

**ポリシー名**: `RoamorySesSendOnlyPolicy`

---

## 2. IAM ユーザーの作成

### 2.1 ユーザー作成

```
AWS Management Console > IAM > Users > Create User
```

**設定値**:

-   **ユーザー名**: `roamory-ses-user`
-   **アクセスタイプ**: プログラマティックアクセス（Access Key）のみ
-   **コンソールアクセス**: 無効

### 2.2 ポリシーのアタッチ

-   作成した `RoamorySesSendOnlyPolicy` を選択

### 2.3 アクセスキーの生成・保存

```
⚠️ 重要: アクセスキーとシークレットキーを安全に保存
- Access Key ID: AKIA...
- Secret Access Key: xxx...
```

---

## 3. セキュリティ設定

### 3.1 MFA 設定（推奨）

-   可能であれば MFA を有効化

### 3.2 アクセスキーローテーション

-   定期的（3-6 ヶ月）にアクセスキーを更新

### 3.3 最小権限の確認

-   SES 以外のサービスへのアクセス権限がないことを確認

---

## 4. テスト用設定

### 4.1 検証済みメールアドレスの確認

```
AWS SES Console > Identities > Email addresses
```

### 4.2 サンドボックス状態での制限

```
送信元: 検証済みメールアドレスのみ
送信先: 検証済みメールアドレスのみ
制限: 1日200通、1秒1通
```

---

## 5. Laravel 設定での使用

### 5.1 環境変数設定

```env
# AWS SES設定
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx...
AWS_DEFAULT_REGION=ap-northeast-1
MAIL_FROM_ADDRESS="your-verified-email@gmail.com"
MAIL_FROM_NAME="Roamory"
```

### 5.2 テスト実行

```bash
php artisan test:ses-email your-verified-email@gmail.com \
  --aws-key=AKIA... \
  --aws-secret=xxx... \
  --from=your-verified-email@gmail.com
```
