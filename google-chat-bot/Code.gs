// =====================================================
// 社労士クイズ Google Chat Bot — メインロジック
// =====================================================

const QUESTIONS_URL = 'https://hirokazumyojo.github.io/sharoushi-study-app/questions.json';
const SENT_IDS_KEY = 'SENT_QUESTION_IDS';
const SPACE_ID_KEY = 'CHAT_SPACE_ID';
const DAILY_COUNT = 3;

/**
 * 毎朝8:30 JSTに実行されるメイン関数
 * 3問のクイズをGoogle Chatスペースに送信する
 */
function sendDailyQuiz() {
  const spaceId = PropertiesService.getScriptProperties().getProperty(SPACE_ID_KEY);
  if (!spaceId) {
    console.error('Chat Space IDが設定されていません。setSpaceId()を実行してください。');
    return;
  }

  const spaceName = 'spaces/' + spaceId;

  // 問題JSONを取得
  const questions = fetchQuestions_();
  if (!questions || questions.length === 0) {
    console.error('問題の取得に失敗しました');
    return;
  }

  // 3問を選択（重複回避）
  const selectedQuestions = selectQuestions_(questions, DAILY_COUNT);

  // ヘッダーメッセージを送信
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'M月d日');
  Chat.Spaces.Messages.create(
    { text: '📚 *おはようございます！本日の社労士クイズ（' + today + '）*\n3問出題します。ボタンをタップして回答してください。' },
    spaceName
  );

  // 各問題カードを送信
  selectedQuestions.forEach(function(question, index) {
    Utilities.sleep(1000); // API rate limit対策
    Chat.Spaces.Messages.create(
      buildQuestionCard_(question, index + 1),
      spaceName
    );
  });

  // 送信済みIDを記録
  markQuestionsSent_(selectedQuestions.map(function(q) { return q.id; }));
  console.log('送信完了: 問題ID ' + selectedQuestions.map(function(q) { return q.id; }).join(', '));
}

/**
 * GitHub Pagesから問題JSONを取得
 */
function fetchQuestions_() {
  try {
    const response = UrlFetchApp.fetch(QUESTIONS_URL, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      console.error('HTTP Error: ' + response.getResponseCode());
      return null;
    }
    return JSON.parse(response.getContentText()).questions;
  } catch (err) {
    console.error('問題取得エラー: ' + err.message);
    return null;
  }
}

/**
 * 重複を避けて問題を選択
 */
function selectQuestions_(questions, count) {
  const props = PropertiesService.getScriptProperties();
  let sentIdsStr = props.getProperty(SENT_IDS_KEY) || '';
  let sentIds = sentIdsStr ? sentIdsStr.split(',').map(Number) : [];

  // 全問出題済みならリセット
  if (sentIds.length >= questions.length - count) {
    sentIds = [];
    props.setProperty(SENT_IDS_KEY, '');
    console.log('全問出題完了。リセットしました。');
  }

  // 未出題の問題をフィルタしてシャッフル
  const available = questions.filter(function(q) {
    return sentIds.indexOf(q.id) === -1;
  });

  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = available[i];
    available[i] = available[j];
    available[j] = temp;
  }

  return available.slice(0, count);
}

/**
 * 送信済み問題IDを記録
 */
function markQuestionsSent_(ids) {
  const props = PropertiesService.getScriptProperties();
  let sentIdsStr = props.getProperty(SENT_IDS_KEY) || '';
  let sentIds = sentIdsStr ? sentIdsStr.split(',') : [];

  ids.forEach(function(id) { sentIds.push(String(id)); });

  // Script Propertiesの値は9KB制限 → 超えそうなら古いIDを削除
  while (sentIds.join(',').length > 8000) {
    sentIds.shift();
  }

  props.setProperty(SENT_IDS_KEY, sentIds.join(','));
}

/**
 * 問題カードメッセージを構築（Cards v2形式）
 */
function buildQuestionCard_(question, questionNumber) {
  const correctAnswer = (question.correct === '呉') ? '誤' : question.correct;

  return {
    cardsV2: [{
      cardId: 'quiz_' + question.id,
      card: {
        header: {
          title: '第' + questionNumber + '問',
          subtitle: question.subject + '　' + question.topic
        },
        sections: [
          {
            widgets: [{
              textParagraph: { text: question.question }
            }]
          },
          {
            header: '回答を選んでください',
            widgets: [{
              buttonList: {
                buttons: [
                  {
                    text: '⭕ 正しい',
                    onClick: {
                      action: {
                        function: 'onAnswerClick',
                        parameters: [
                          { key: 'userAnswer', value: '正' },
                          { key: 'correctAnswer', value: correctAnswer },
                          { key: 'subject', value: question.subject },
                          { key: 'topic', value: question.topic },
                          { key: 'questionText', value: question.question.substring(0, 800) },
                          { key: 'notes', value: (question.notes || '').substring(0, 800) },
                          { key: 'num', value: String(questionNumber) }
                        ]
                      }
                    }
                  },
                  {
                    text: '❌ 誤り',
                    onClick: {
                      action: {
                        function: 'onAnswerClick',
                        parameters: [
                          { key: 'userAnswer', value: '誤' },
                          { key: 'correctAnswer', value: correctAnswer },
                          { key: 'subject', value: question.subject },
                          { key: 'topic', value: question.topic },
                          { key: 'questionText', value: question.question.substring(0, 800) },
                          { key: 'notes', value: (question.notes || '').substring(0, 800) },
                          { key: 'num', value: String(questionNumber) }
                        ]
                      }
                    }
                  }
                ]
              }
            }]
          }
        ]
      }
    }]
  };
}
