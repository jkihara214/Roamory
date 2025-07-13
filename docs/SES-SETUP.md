# 🚀 Roamory - AWS SES 環境変数設定ガイド

## 🎯 **概要**

このガイドでは、**手間がかからず、セキュリティが守られる方法**で AWS SES 環境変数を設定します。

### **特徴**

- ✅ **自動セットアップ**: ワンコマンドで環境構築
- ✅ **セキュリティ確保**: .env ファイルは Git 管理対象外
- ✅ **簡単確認**: 設定状況をワンコマンドで確認
- ✅ **エラー防止**: 設定ミスを自動検出

---

## 🛠️ **セットアップ手順**

### **Step 1: 自動セットアップ実行**

```bash
# Roamoryプロジェクトのルートディレクトリで実行
./setup-env.sh
```

**実行結果例**:

```
🚀 Roamory - AWS SES Environment Setup
======================================
✅ .env ファイルが作成されました

📝 次のステップ:
1. .env ファイルを編集してください:
   vi .env  または  nano .env
```

### **Step 2: 認証情報の編集**

```bash
# お好みのエディタで .env ファイルを編集
vi .env
# または
nano .env
# または
code .env
```

**編集する項目**:

```env
# ⚠️ 以下の値を実際の認証情報に変更してください
AWS_ACCESS_KEY_ID=実際のアクセスキーID
AWS_SECRET_ACCESS_KEY=実際のシークレットキー
MAIL_FROM_ADDRESS=実際の検証済みメールアドレス@gmail.com
```

### **Step 3: 設定確認**

```bash
# 設定状況を確認
./check-env.sh
```

**正常設定時の出力例**:

```
🔍 Roamory - Environment Variables Check
========================================
✅ .env ファイルが存在します

🔐 AWS SES Configuration:
   AWS_ACCESS_KEY_ID: ✅ 設定済み (AKIA1234...)
   AWS_SECRET_ACCESS_KEY: ✅ 設定済み (wJalrXUt...)
   AWS_DEFAULT_REGION: ap-northeast-1

📧 Mail Configuration:
   MAIL_FROM_ADDRESS: ✅ 設定済み (your-email@gmail.com)
   MAIL_FROM_NAME: Roamory

✅ 設定完了！SESテストを実行してください:
   docker-compose exec backend php artisan test:ses-email your-email@gmail.com
```

### **Step 4: Docker コンテナ再起動**

```bash
# 設定を反映するためにコンテナ再起動
docker-compose down
docker-compose up -d
```

### **Step 5: SES テスト実行**

```bash
# SES メール送信テスト
docker-compose exec backend php artisan test:ses-email 実際のメールアドレス@gmail.com
```

---

## 🔧 **トラブルシューティング**

### **よくある問題と解決方法**

#### **❌ 問題 1: "❌ デフォルト値のまま（要変更）"**

```bash
# 原因: .envファイルの値が未変更
# 解決: .envファイルを編集して実際の認証情報に変更

vi .env
# 編集後
./check-env.sh  # 再確認
```

#### **❌ 問題 2: "❌ Docker containers are not running"**

```bash
# 原因: Dockerコンテナが起動していない
# 解決: コンテナを起動

docker-compose up -d
./check-env.sh  # 再確認
```

#### **❌ 問題 3: "❌ 環境変数がコンテナに反映されていません"**

```bash
# 原因: .env変更後にコンテナ再起動していない
# 解決: コンテナを再起動

docker-compose down
docker-compose up -d
./check-env.sh  # 再確認
```

#### **❌ 問題 4: SES テストでエラー**

```bash
# 原因1: AWS認証情報が間違っている
# 解決: IAMユーザーのアクセスキーを再確認

# 原因2: メールアドレスがAWS SESで未検証
# 解決: AWS SESコンソールでメールアドレスを検証

# 原因3: SES権限不足
# 解決: IAMユーザーにSES権限があることを確認
```

---

## 🔒 **セキュリティ**

### **保護されている項目**

- ✅ **.env ファイル**: .gitignore により Git 管理対象外
- ✅ **認証情報表示**: スクリプトでは認証情報の一部のみ表示
- ✅ **ファイル権限**: .env ファイルは適切な権限で作成

### **セキュリティチェック**

```bash
# .envファイルがGit追跡されていないことを確認
git status

# .envファイルが .gitignore に含まれていることを確認
grep -n "\.env" .gitignore
```

---

## 📁 **ファイル構成**

```
roamory/
├── .env                    # 🔐 環境変数設定ファイル（Git管理対象外）
├── .gitignore             # ✅ .env ファイルを除外
├── docker-compose.yml     # ✅ SES設定済み
├── setup-env.sh          # 🛠️ 自動セットアップスクリプト
├── check-env.sh          # 🔍 設定確認スクリプト
└── SES-SETUP.md          # 📖 このファイル
```

---

## 🚀 **次のステップ**

### **設定完了後の作業**

1. **ユーザー登録機能テスト**
2. **メール認証フローの確認**
3. **本番アクセス申請承認の確認**
4. **本番環境への適用**

### **本番環境設定**

```bash
# 本番環境では以下の値に変更
MAIL_FROM_ADDRESS=noreply@roamory.com
AWS_DEFAULT_REGION=ap-northeast-1
```

---

## 💡 **ワンライナーコマンド**

### **完全セットアップ（推奨）**

```bash
# セットアップ → 設定確認 → Docker再起動
./setup-env.sh && echo "📝 .envファイルを編集してください" && echo "編集後、以下を実行: ./check-env.sh && docker-compose down && docker-compose up -d"
```

### **設定確認 → 再起動**

```bash
# 設定確認後に問題なければ自動再起動
./check-env.sh && docker-compose down && docker-compose up -d
```

---

## ❓ **よくある質問**

### **Q: .env ファイルを間違って削除してしまいました**

```bash
# A: setup-env.sh を再実行してください
./setup-env.sh
```

### **Q: 設定が正しいか確認したい**

```bash
# A: check-env.sh を実行してください
./check-env.sh
```

### **Q: AWS 認証情報を変更したい**

```bash
# A: .env ファイルを編集後、コンテナを再起動してください
vi .env
docker-compose down && docker-compose up -d
```

---

🎉 **これで AWS SES 環境変数設定は完了です！**
問題が発生した場合は、このガイドのトラブルシューティングセクションを参照してください。
