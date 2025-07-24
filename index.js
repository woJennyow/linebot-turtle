const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: '你的 channelAccessToken',
  channelSecret: '你的 channelSecret'
};

const client = new line.Client(config);
const app = express();

// ✅ middleware 放在 json parser 前，否則驗證失敗！
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    const results = await Promise.all(events.map(handleEvent));
    res.status(200).json(results); // ✅ 明確回傳 200
  } catch (err) {
    console.error('Webhook 錯誤：', err);
    res.status(500).end(); // ✅ 錯誤處理
  }
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return null;
  const msg = event.message.text.trim();

  if (msg === '開始遊戲') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: storyData.intro
    });
  }

  if (/^[1-7]$/.test(msg)) {
    const topic = storyData.interactions[msg];
    const qList = topic.questions.join('\n');
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你選擇的是「${topic.keyword}」請輸入題號：\n${qList}`
    });
  }

  const match = msg.match(/^(\d)-(\d)$/);
  if (match) {
    const [_, topicId, qId] = match;
    const topic = storyData.interactions[topicId];
    const question = topic?.questions[qId - 1];
    const answer = topic?.answers[qId];
    if (!question || !answer) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '找不到此問題或答案，請重新輸入。'
      });
    }
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `問題：「${question}」\n答案：${answer}\n\n請輸入 1~7 以繼續查詢其他主題`
    });
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '請輸入「開始遊戲」，或 1~7 選擇主題，再輸入格式如「1-2」來查詢問題答案。'
  });
}

const storyData = {
  intro: "題幹：自從阿明被爸爸胖揍一頓之後就開始頻繁地撿破爛...（略）",
  interactions: {
    // 你原本的題庫照貼上
  }
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
