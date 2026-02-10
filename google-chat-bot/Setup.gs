// =====================================================
// セットアップユーティリティ（Webhook方式）
// =====================================================

/**
 * Webhook URLを設定
 * Google Chat スペース → アプリとインテグレーション → Webhook を管理 で取得したURLを貼り付け
 */
function setWebhookUrl() {
  const url = 'YOUR_WEBHOOK_URL_HERE'; // ← ここにWebhook URLを貼り付けて実行
  PropertiesService.getScriptProperties().setProperty('WEBHOOK_URL', url);
  console.log('Webhook URL を設定しました');
}

/**
 * 毎朝8:30 JSTのトリガーを設定
 */
function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'sendDailyQuiz') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('sendDailyQuiz')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .nearMinute(30)
    .inTimezone('Asia/Tokyo')
    .create();

  console.log('毎日8:30 JSTのトリガーを作成しました');
}

/**
 * トリガーを削除
 */
function deleteDailyTrigger() {
  let deleted = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'sendDailyQuiz') {
      ScriptApp.deleteTrigger(trigger);
      deleted++;
    }
  });
  console.log(deleted + '個のトリガーを削除しました');
}

/**
 * テスト送信（1問だけ）
 */
function testSendOneQuestion() {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty('WEBHOOK_URL');
  if (!webhookUrl) {
    console.error('Webhook URLが未設定です。setWebhookUrl()を実行してください。');
    return;
  }

  const questions = fetchQuestions_();
  if (!questions || questions.length === 0) {
    console.error('問題の取得に失敗しました');
    return;
  }

  // 問題送信
  sendWebhook_(webhookUrl, buildQuestionCard_(questions[0], 1));
  console.log('問題を送信しました。15秒後に正解を送信します...');

  // 15秒後に正解送信
  Utilities.sleep(15000);
  sendWebhook_(webhookUrl, buildAnswerCard_(questions[0], 1));
  console.log('正解を送信しました');
}

/**
 * 送信済み問題をリセット
 */
function resetSentQuestions() {
  PropertiesService.getScriptProperties().deleteProperty('SENT_QUESTION_IDS');
  console.log('送信済み問題をリセットしました。全問が再出題可能です。');
}

/**
 * 現在の設定状況を表示
 */
function showStatus() {
  const props = PropertiesService.getScriptProperties();
  const hasWebhook = !!props.getProperty('WEBHOOK_URL');
  const sentIdsStr = props.getProperty('SENT_QUESTION_IDS') || '';
  const sentCount = sentIdsStr ? sentIdsStr.split(',').length : 0;

  console.log('=== 設定状況 ===');
  console.log('Webhook URL: ' + (hasWebhook ? '設定済み' : '未設定'));
  console.log('送信済み問題数: ' + sentCount + ' / 3500');
  console.log('残り問題数: ' + (3500 - sentCount));

  const hasTrigger = ScriptApp.getProjectTriggers().some(function(t) {
    return t.getHandlerFunction() === 'sendDailyQuiz';
  });
  console.log('トリガー: ' + (hasTrigger ? '設定済み' : '未設定'));
}
