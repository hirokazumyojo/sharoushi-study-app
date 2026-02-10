// =====================================================
// 社労士クイズ Google Chat Bot（Webhook方式）
// =====================================================

const QUESTIONS_URL = 'https://hirokazumyojo.github.io/sharoushi-study-app/questions.json';
const SENT_IDS_KEY = 'SENT_QUESTION_IDS';
const WEBHOOK_URL_KEY = 'WEBHOOK_URL';
const DAILY_COUNT = 3;
const ANSWER_DELAY_SEC = 30; // 問題送信後、何秒後に正解を送るか

/**
 * 毎朝8:30 JSTに実行されるメイン関数
 */
function sendDailyQuiz() {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty(WEBHOOK_URL_KEY);
  if (!webhookUrl) {
    console.error('Webhook URLが未設定です。setWebhookUrl()を実行してください。');
    return;
  }

  const questions = fetchQuestions_();
  if (!questions || questions.length === 0) {
    console.error('問題の取得に失敗しました');
    return;
  }

  const selected = selectQuestions_(questions, DAILY_COUNT);

  // ヘッダー送信
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'M月d日');
  sendWebhook_(webhookUrl, {
    text: '📚 *おはようございます！本日の社労士クイズ（' + today + '）*\n3問出題します。正解だと思ったら ⭕、誤りだと思ったら ❌ を頭の中で回答してください。\n' + ANSWER_DELAY_SEC + '秒後に正解が表示されます。'
  });

  // 各問題を送信
  selected.forEach(function(question, index) {
    Utilities.sleep(2000);

    // 問題カード送信
    sendWebhook_(webhookUrl, buildQuestionCard_(question, index + 1));

    // 正解を遅延送信
    Utilities.sleep(ANSWER_DELAY_SEC * 1000);
    sendWebhook_(webhookUrl, buildAnswerCard_(question, index + 1));
  });

  markQuestionsSent_(selected.map(function(q) { return q.id; }));
  console.log('送信完了: 問題ID ' + selected.map(function(q) { return q.id; }).join(', '));
}

/**
 * Webhookにメッセージを送信
 */
function sendWebhook_(url, payload) {
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * GitHub Pagesから問題JSONを取得
 */
function fetchQuestions_() {
  try {
    const response = UrlFetchApp.fetch(QUESTIONS_URL, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return null;
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

  if (sentIds.length >= questions.length - count) {
    sentIds = [];
    props.setProperty(SENT_IDS_KEY, '');
    console.log('全問出題完了。リセットしました。');
  }

  const available = questions.filter(function(q) {
    return sentIds.indexOf(q.id) === -1;
  });

  // シャッフル
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

  while (sentIds.join(',').length > 8000) {
    sentIds.shift();
  }
  props.setProperty(SENT_IDS_KEY, sentIds.join(','));
}

/**
 * 問題カード（正解は含まない）
 */
function buildQuestionCard_(question, num) {
  return {
    cardsV2: [{
      cardId: 'q_' + question.id,
      card: {
        header: {
          title: '第' + num + '問',
          subtitle: question.subject + '　' + question.topic
        },
        sections: [{
          widgets: [{
            textParagraph: {
              text: question.question + '\n\n<b>⭕ 正しい　or　❌ 誤り ？</b>'
            }
          }]
        }]
      }
    }]
  };
}

/**
 * 正解カード
 */
function buildAnswerCard_(question, num) {
  const isCorrect = question.correct === '正';
  const emoji = isCorrect ? '⭕' : '❌';
  const label = isCorrect ? '正しい' : '誤り';

  var sections = [
    {
      widgets: [{
        decoratedText: {
          topLabel: '第' + num + '問の正解',
          text: '<b>' + emoji + ' ' + label + '</b>',
          wrapText: true
        }
      }]
    }
  ];

  if (question.notes && question.notes.trim() !== '') {
    sections.push({
      header: '📖 解説',
      widgets: [{
        textParagraph: { text: question.notes }
      }]
    });
  }

  return {
    cardsV2: [{
      cardId: 'a_' + question.id,
      card: {
        header: {
          title: emoji + ' 第' + num + '問 — 正解発表',
          subtitle: question.subject + '　' + question.topic
        },
        sections: sections
      }
    }]
  };
}
