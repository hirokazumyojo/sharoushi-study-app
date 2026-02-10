// =====================================================
// カードクリックハンドラー
// =====================================================

/**
 * Google Chatからのカードボタンクリックイベントを処理
 */
function onCardClick(event) {
  if (event.common && event.common.invokedFunction === 'onAnswerClick') {
    return handleAnswerClick_(event);
  }
  return {};
}

/**
 * 回答ボタンクリックの処理
 */
function handleAnswerClick_(event) {
  const p = event.common.parameters;
  const isCorrect = (p.userAnswer === p.correctAnswer);

  const resultEmoji = isCorrect ? '🎉' : '😢';
  const resultText = isCorrect ? '正解！' : '不正解...';

  const sections = [
    {
      widgets: [{
        decoratedText: {
          topLabel: '科目',
          text: p.subject,
          bottomLabel: p.topic,
          wrapText: true
        }
      }]
    },
    {
      header: '問題',
      widgets: [{
        textParagraph: { text: p.questionText }
      }]
    },
    {
      header: '結果',
      widgets: [
        {
          decoratedText: {
            topLabel: 'あなたの回答',
            text: '<b>' + p.userAnswer + '</b>',
            wrapText: true
          }
        },
        {
          decoratedText: {
            topLabel: '正解',
            text: '<b>' + p.correctAnswer + '</b>',
            wrapText: true
          }
        }
      ]
    }
  ];

  if (p.notes && p.notes.trim() !== '') {
    sections.push({
      header: '📖 解説',
      widgets: [{
        textParagraph: { text: p.notes }
      }]
    });
  }

  return {
    actionResponse: { type: 'UPDATE_MESSAGE' },
    cardsV2: [{
      cardId: 'result_' + p.num,
      card: {
        header: {
          title: resultEmoji + ' 第' + p.num + '問 - ' + resultText,
          subtitle: p.subject + '　' + p.topic
        },
        sections: sections
      }
    }]
  };
}
