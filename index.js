// LINE Bot 海龜湯遊戲 - 整合版（支援數字選題與故事還原選擇題）

const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: 'cTOKJdSRlL8LYBgrQtKCB/DZ3ajAOHYN2aZyh3j+Gs4j6sK6lo78Um29Vo+W34RQi2jzRUecamad5II9RnKCMkZ5EeSBkb8TQTGbhOdU7dMuUXz9aMYvGnqQQ+GJqHd/NeRTggi5ZQPMpSPf8uy0iwdB04t89/1O/w1cDnyilFU=',
  channelSecret: '7c2ce056206edad1c9adb78946f446a7'
};

const client = new line.Client(config);
const app = express();
app.use(line.middleware(config));

// 使用者狀態記憶（暫時放記憶體，正式可用 Redis 等替代）
const userState = {}; // userId => { topicId }

// 題庫資料（只貼上簡略版，請替換成完整題庫）
const storyData = {
  intro: "題幹：自從阿明被爸爸胖揍一頓之後就開始頻繁地撿破爛...\n請輸入一個數字選擇互動對象：\n1. 阿明\n2. 爸爸\n3. 胖揍一頓\n4. 破爛\n5. 姊姊\n6. 眼神\n7. 還原故事問題",
  interactions: {
    1: {
      keyword: "阿明",
      questions: ["1. 阿明是小孩嗎？", "2. 阿明的個性記仇嗎？"],
      answers: {
        1: "是。再幾年才會上小學。",
        2: "否。"
      }
    },
    7: {
      keyword: "還原故事問題",
      questions: [
        "1. 阿明撿的破爛有什麼共同的特性？\nＡ 紙類\nＢ 可以賣很多錢貼補家用\nＣ 能讓爸爸更生氣\nＤ 製作武器的原材料",
        "2. 爸爸打阿明的原因是？\nＡ 毀損傢俱和房屋使其無法使用\nＢ 酗酒\nＣ 為了趕走不是親生的阿明\nＤ 制止阿明繼續做某件事",
        "3. 姊姊和阿明的主要矛盾是？\nＡ 搶文具\nＢ 推卸家事\nＣ 偷錢\nＤ 不想當童養媳",
        "4. 阿明的特殊之處是？\nＡ 慧眼識破爛\nＢ 扛打體質\nＣ 愛畫畫的手\nＤ 武器大師"
      ],
      answers: {
        1: "Ａ 紙類",
        2: "Ｄ 制止阿明繼續做某件事",
        3: "Ａ 搶文具",
        4: "Ｃ 愛畫畫的手"
      }
    }
  }
};

app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    const results = await Promise.all(events.map(handleEvent));
    res.status(200).json(results);
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const userId = event.source.userId;
  const msg = event.message.text.trim();

  // 開始遊戲
  if (msg === '開始遊戲') {
    userState[userId] = {}; // 重置狀態
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: storyData.intro
    });
  }

  // 選擇主題 1~7
  if (/^[1-7]$/.test(msg)) {
    const topicId = msg;
    const topic = storyData.interactions[topicId];
    if (!topic) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '❗ 找不到主題，請重新輸入 1~7'
      });
    }
    userState[userId] = { topicId }; // 記錄主題
    const qList = topic.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你選擇的是「${topic.keyword}」\n請輸入問題編號（例如 1）:\n${qList}`
    });
  }

  // 如果使用者已選主題，就等他輸入問題號碼
  if (userState[userId]?.topicId) {
    const topicId = userState[userId].topicId;
    const topic = storyData.interactions[topicId];
    const qId = parseInt(msg);
    const question = topic.questions[qId - 1];
    const answer = topic.answers[qId];

    if (!question || !answer) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '❗ 無效的問題編號，請重新輸入有效數字。'
      });
    }

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `問題：「${question}」\n答案：${answer}\n\n請繼續輸入問題編號，或輸入 1~7 選擇其他主題。`
    });
  }

  // 其他情況提示
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '請輸入「開始遊戲」，或輸入數字 1~7 選擇主題。'
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

