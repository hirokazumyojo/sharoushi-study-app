# 社労士クイズ Google Chat Bot セットアップガイド（Webhook方式）

毎朝8:30に3問の社労士一問一答をGoogle Chatに送信。30秒後に正解+解説を表示。

## 前提条件

- Google Workspaceアカウント

## セットアップ手順

### Step 1: Google Chat でWebhook URLを取得

1. Google Chat でスペースを開く（または新規作成）
2. スペース名クリック → **アプリとインテグレーション** → **Webhookを管理**
3. 名前: `社労士クイズBot` → **保存**
4. 表示される Webhook URL をコピー

### Step 2: Apps Script プロジェクト作成

1. [script.google.com](https://script.google.com/) → **新しいプロジェクト**
2. プロジェクト名を「社労士クイズBot」に変更
3. 設定（歯車）→「appsscript.json マニフェストファイルをエディタで表示する」にチェック

### Step 3: コードを貼り付け

1. `Code.gs` の内容を全て置き換え
2. ファイル「+」→ スクリプト → `Setup` → Setup.gs の内容を貼り付け
3. `appsscript.json` の内容を置き換え
4. Ctrl+S で保存

### Step 4: Webhook URLを設定

1. `Setup.gs` の `setWebhookUrl()` 内の `'YOUR_WEBHOOK_URL_HERE'` をStep 1のURLに書き換え
2. 関数セレクタで **setWebhookUrl** → **実行**
3. 権限の承認ダイアログが出たら許可
4. 実行後、URLの文字列をエディタから削除（セキュリティ）

### Step 5: テスト

1. 関数セレクタで **testSendOneQuestion** → **実行**
2. Chatに問題カードが届き、30秒後に正解カードが届くか確認

### Step 6: 毎朝8:30の自動配信を開始

1. 関数セレクタで **createDailyTrigger** → **実行**

## 便利な関数

| 関数 | 説明 |
|------|------|
| `sendDailyQuiz()` | 手動で3問送信 |
| `testSendOneQuestion()` | 1問だけテスト送信 |
| `showStatus()` | 設定状況を確認 |
| `resetSentQuestions()` | 出題済みリセット（全問再出題） |
| `createDailyTrigger()` | トリガー作成 |
| `deleteDailyTrigger()` | トリガー削除 |
