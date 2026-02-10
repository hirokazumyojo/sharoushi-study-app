// =====================================================
// セットアップユーティリティ
// =====================================================

/**
 * Chat Space IDを設定
 * Chat URLの spaces/ 以降の部分を指定
 * 例: https://mail.google.com/chat/#chat/space/AAAA_BBBBBB → 'AAAA_BBBBBB'
 */
function setSpaceId() {
  const spaceId = 'YOUR_SPACE_ID_HERE'; // ← ここを書き換えて実行
  PropertiesService.getScriptProperties().setProperty('CHAT_SPACE_ID', spaceId);
  console.log('Space ID を設定しました: ' + spaceId);
}

/**
 * 毎朝8:30 JSTのトリガーを設定
 */
function createDailyTrigger() {
  // 既存のトリガーを削除（重複防止）
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
 * テスト送信（1問だけ送信）
 */
function testSendOneQuestion() {
  const spaceId = PropertiesService.getScriptProperties().getProperty('CHAT_SPACE_ID');
  if (!spaceId) {
    console.error('Space IDが未設定です。setSpaceId()を実行してください。');
    return;
  }

  const questions = fetchQuestions_();
  if (!questions || questions.length === 0) {
    console.error('問題の取得に失敗しました');
    return;
  }

  Chat.Spaces.Messages.create(
    buildQuestionCard_(questions[0], 1),
    'spaces/' + spaceId
  );
  console.log('テスト送信成功');
}

/**
 * 送信済み問題をリセット
 */
function resetSentQuestions() {
  PropertiesService.getScriptProperties().deleteProperty(SENT_IDS_KEY);
  console.log('送信済み問題をリセットしました。全問が再出題可能です。');
}

/**
 * 現在の設定状況を表示
 */
function showStatus() {
  const props = PropertiesService.getScriptProperties();
  const spaceId = props.getProperty('CHAT_SPACE_ID');
  const sentIdsStr = props.getProperty(SENT_IDS_KEY) || '';
  const sentCount = sentIdsStr ? sentIdsStr.split(',').length : 0;

  console.log('=== 設定状況 ===');
  console.log('Space ID: ' + (spaceId || '未設定'));
  console.log('送信済み問題数: ' + sentCount + ' / 3500');
  console.log('残り問題数: ' + (3500 - sentCount));

  const hasTrigger = ScriptApp.getProjectTriggers().some(function(t) {
    return t.getHandlerFunction() === 'sendDailyQuiz';
  });
  console.log('トリガー: ' + (hasTrigger ? '設定済み' : '未設定'));
}
