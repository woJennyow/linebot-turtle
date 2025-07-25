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
app.use(express.json());

const storyData = {
  intro: "題幹：自從阿明被爸爸胖揍一頓之後就開始頻繁地撿破爛，看見阿明這麼做，姊姊的眼神很是複雜。\n請輸入一個數字以選擇互動對象：\n1. 阿明\n2. 爸爸\n3. 胖揍一頓\n4. 破爛\n5. 姊姊\n6. 眼神\n7. 還原故事（結局挑戰）",

  interactions: {
    1: { keyword: "阿明", questions: [...], answers: {...} },
    2: { keyword: "爸爸", questions: [...], answers: {...} },
    3: { keyword: "胖揍一頓", questions: [...], answers: {...} },
    4: { keyword: "破爛", questions: [...], answers: {...} },
    5: { keyword: "姊姊", questions: [...], answers: {...} },
    6: { keyword: "眼神", questions: [...], answers: {...} },
  },

  ending: {
    questions: [
      "一、阿明撿的破爛有什麼共同的特性？\nA. 紙類\nB. 可以賣很多錢貼補家用\nC. 能讓爸爸更生氣\nD. 製作武器的原材料",
      "二、爸爸打阿明的原因是？\nA. 毀損傢俱和房屋使其無法使用\nB. 酗酒\nC. 為了趕走不是親生的阿明\nD. 制止阿明繼續做某件事",
      "三、姊姊和阿明的主要矛盾是？\nA. 搶文具\nB. 家事和農活過於繁重，相互推卸工作\nC. 偷錢\nD. 姊姊不想成為阿明的童養媳",
      "四、阿明的特殊之處究竟是什麼？\nA. 一雙能從破爛中找出值錢物品的慧眼\nB. 如鋼鐵般扛打挨揍的身軀\nC. 愛畫畫的手\nD. 武器大師"
    ],
    answers: ['A', 'D', 'A', 'C']
  }
};

let userState = {};

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
  const userId = event.source.userId;
  const msg = event.message.text.trim();
  const state = userState[userId] || {};

  if (msg === '開始遊戲') {
    userState[userId] = {}; // reset state
    return reply(event, storyData.intro);
  }

  if (msg === '0') {
    delete userState[userId].topic;
    return reply(event, storyData.intro);
  }

  if (!state.topic && /^[1-6]$/.test(msg)) {
    const topic = storyData.interactions[msg];
    userState[userId].topic = msg;
    return reply(event, `你選擇的是「${topic.keyword}」請輸入題號：\n${topic.questions.join('\n')}`);
  }

  if (state.topic && /^[1-9]$/.test(msg)) {
    const topic = storyData.interactions[state.topic];
    const question = topic?.questions[msg - 1];
    const answer = topic?.answers[msg];
    if (!question || !answer) {
      return reply(event, `❗ 找不到這題，請輸入正確題號或輸入 0 返回主題選單。`);
    }
    return reply(event, `問題：「${question}」\n答案：${answer}\n\n您可以繼續輸入數字問同主題的問題，或輸入 0 換主題。`);
  }

  if (msg === '7') {
    userState[userId] = { endingStep: 0, correct: 0 };
    return reply(event, `🧩 結局挑戰開始！請回答下列問題，僅能輸入 A~D。\n${storyData.ending.questions[0]}`);
  }

  if (state.hasOwnProperty('endingStep')) {
    const step = state.endingStep;
    const answer = storyData.ending.answers[step];
    if (!/^[A-Da-d]$/.test(msg)) {
      return reply(event, `請輸入 A~D 作為選項！\n${storyData.ending.questions[step]}`);
    }
    if (msg.toUpperCase() === answer) {
      userState[userId].correct++;
      userState[userId].endingStep++;
      if (userState[userId].endingStep >= storyData.ending.questions.length) {
        const passed = userState[userId].correct === 4;
        delete userState[userId];
        return reply(event, passed ? '🎉 恭喜你正確還原整個故事！其實整個故事就是阿拉花瓜!' : '😢 很遺憾，你回答錯了幾題，請再試一次。輸入 7 重來結局挑戰或輸入 0 回主題選單。');
      } else {
        return reply(event, `✅ 答對了！下一題：\n${storyData.ending.questions[userState[userId].endingStep]}`);
      }
    } else {
      return reply(event, `❌ 錯了，再想想！請重新回答：\n${storyData.ending.questions[step]}`);
    }
  }

  return reply(event, '請輸入「開始遊戲」，或 1~6 選擇主題，或輸入 7 開始結局挑戰。');
}

function reply(event, text) {
  return client.replyMessage(event.replyToken, { type: 'text', text });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

