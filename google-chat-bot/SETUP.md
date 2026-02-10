# 社労士クイズ Google Chat Bot セットアップガイド

毎朝8:30に3問の社労士一問一答をGoogle Chatに送信するBotです。

## 前提条件

- Google Workspaceアカウント
- Google Cloud Consoleへのアクセス権

---

## Step 1: Google Cloud プロジェクト設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（例: `sharoushi-quiz-bot`）
3. **プロジェクト番号**をメモする（後で使用）
4. **APIとサービス > ライブラリ** で「Google Chat API」を検索して**有効化**

## Step 2: Google Chat API の設定

1. Google Cloud Console で **Google Chat API** を検索 → **構成** タブ
2. 以下を入力:
   - **アプリ名**: 社労士クイズBot
   - **説明**: 毎朝3問の社労士一問一答クイズを出題します
   - **インタラクティブ機能を有効にする**: ON
   - **機能**: 「スペースとグループの会話に参加する」にチェック
   - **接続設定**: **Apps Script** を選択
   - **デプロイID**: Step 5 で入力するので一旦空欄
   - **公開設定**: 自分のドメインまたは特定ユーザー
3. **保存**

## Step 3: Apps Script プロジェクト作成

1. [script.google.com](https://script.google.com/) にアクセス
2. **新しいプロジェクト** をクリック
3. プロジェクト名を「社労士クイズBot」に変更
4. **プロジェクトの設定**（歯車アイコン）:
   - 「Google Cloud Platform (GCP) プロジェクト」で **プロジェクトを変更**
   - Step 1 のプロジェクト番号を入力 → **プロジェクトを設定**
   - 「"appsscript.json" マニフェストファイルをエディタで表示する」に**チェック**

## Step 4: コードを貼り付け

エディタで以下のファイルを作成（各ファイルの内容はこのディレクトリの `.gs` / `.json` ファイル参照）:

1. `Code.gs` — 既存の `Code.gs` の内容を全て置き換える
2. ファイル「+」→ スクリプト → `CardClick` → `CardClick.gs` の内容を貼り付け
3. ファイル「+」→ スクリプト → `Setup` → `Setup.gs` の内容を貼り付け
4. `appsscript.json` をクリック → `appsscript.json` の内容で置き換え

**Advanced Chat Service を有効化:**
- 左サイドバーの「サービス」の横の「+」をクリック
- **Google Chat API** を探して**追加**

**Ctrl+S** で保存。

## Step 5: デプロイ

1. Apps Script エディタで **デプロイ > テストデプロイ**
2. **ヘッドデプロイメントID** をコピー
3. Google Cloud Console → Chat API → 構成 に戻る
4. **接続設定** の「Apps Script プロジェクトのデプロイ ID」に貼り付け
5. **保存**

## Step 6: Bot をスペースに追加 & Space ID 設定

1. [Google Chat](https://chat.google.com/) を開く
2. 新しいスペースを作成（例: 「社労士クイズ」）、または既存スペースを使用
3. スペース名をクリック → **アプリとインテグレーション** → 「社労士クイズBot」を追加
4. ブラウザURLからSpace IDを取得:
   - URL例: `https://mail.google.com/chat/#chat/space/AAAA_BBBBBB`
   - Space ID = `AAAA_BBBBBB` の部分
5. Apps Script エディタで `Setup.gs` を開く
6. `setSpaceId()` 関数の `'YOUR_SPACE_ID_HERE'` を実際のSpace IDに書き換え
7. 関数セレクタで `setSpaceId` を選択 → **実行**
8. 権限の承認を求められたら許可する

## Step 7: テスト送信

1. 関数セレクタで `testSendOneQuestion` を選択 → **実行**
2. Google Chat のスペースに問題カードが表示されるか確認
3. **⭕ 正しい** または **❌ 誤り** ボタンをタップ
4. カードが更新されて正解 + 解説が表示されるか確認

## Step 8: 日次トリガー設定

1. 関数セレクタで `createDailyTrigger` を選択 → **実行**
2. 毎朝8:15〜8:45頃に3問が自動送信されます

## Step 9: 動作確認

1. `showStatus` を実行して設定状況を確認:
   ```
   === 設定状況 ===
   Space ID: (設定済み)
   送信済み問題数: 1 / 3500
   残り問題数: 3499
   トリガー: 設定済み
   ```

---

## 便利な関数

| 関数 | 説明 |
|------|------|
| `sendDailyQuiz()` | 手動で3問送信 |
| `testSendOneQuestion()` | 1問だけテスト送信 |
| `showStatus()` | 設定状況を確認 |
| `resetSentQuestions()` | 出題済みをリセット（全問再出題） |
| `createDailyTrigger()` | トリガー作成 |
| `deleteDailyTrigger()` | トリガー削除 |

## トラブルシューティング

- **「権限がありません」エラー**: 実行時に権限承認のダイアログが出たら「許可」をクリック
- **問題が送信されない**: `showStatus()` でSpace IDとトリガーが設定済みか確認
- **ボタンが反応しない**: Chat API の構成でインタラクティブ機能がONか確認
- **トリガーの時間がずれる**: Apps Script のトリガーは±15分の誤差があります（仕様）
