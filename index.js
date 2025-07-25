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

// 使用者狀態暫存（簡化記憶）
const userStates = {}; // { userId: { mode: 'topic', currentTopic: '1' } }

const storyData = {
  intro: "題幹：自從阿明被爸爸胖揍一頓之後就開始頻繁地撿破爛，看見阿明這麼做，姊姊的眼神很是複雜。\n請輸入一個數字以選擇互動對象：\n1. 阿明\n2. 爸爸\n3. 胖揍一頓\n4. 破爛\n5. 姊姊\n6. 眼神\n7. 還原故事問題",

  interactions: {
    1: {
      keyword: "阿明",
      questions: [
        "1. 阿明是小孩嗎？",
        "2. 阿明的個性記仇嗎？",
        "3. 阿明天性頑劣嗎？",
        "4. 阿明有特殊之處嗎？",
        "5. 阿明挨打後是故意惹爸爸生氣嗎？"
      ],
      answers: {
        1: "是。再幾年才會上小學。",
        2: "否。",
        3: "否。他是個會幫家裡幹農活做家務的乖孩子。",
        4: "是。他特別喜歡做一件事，而且有天份！",
        5: "否。恰好相反，是為了讓以後爸爸不要再不開心了。"
      }
    },
    2: {
      keyword: "爸爸",
      questions: [
        "1. 跟爸爸職業有關嗎？",
        "2. 爸爸脾氣暴躁嗎？",
        "3. 爸爸討厭阿明嗎？",
        "4. 爸爸酗酒嗎？",
        "5. 爸爸看不起阿明嗎？",
        "6. 是親生父親嗎？"
      ],
      answers: {
        1: "否。爸爸只是個貧困茶農。",
        2: "否。爸爸生氣都有原因。",
        3: "否。對他寄予厚望。",
        4: "否。認真工作。",
        5: "否。因為重視才責打。",
        6: "是。絕對是親生的。"
      }
    },
    3: {
      keyword: "胖揍一頓",
      questions: [
        "1. 真的是阿明錯？",
        "2. 是為了制止阿明做事？",
        "3. 是為了趕走他？",
        "4. 真的打了嗎？",
        "5. 是親爹打的嗎？"
      ],
      answers: {
        1: "是。阿明知錯了。",
        2: "是。爸爸喊：『我的牆壁！我的地板！』",
        3: "否。",
        4: "是。痛得要命。",
        5: "是。沒問題。"
      }
    },
    4: {
      keyword: "破爛",
      questions: [
        "1. 可以賣錢嗎？",
        "2. 會放家裡嗎？",
        "3. 可做其他用途？",
        "4. 可傷人嗎？",
        "5. 可成武器嗎？"
      ],
      answers: {
        1: "是。但不值錢。",
        2: "是。但不是主要目的。",
        3: "是。與特殊之處有關。",
        4: "否。風吹就走。",
        5: "與此無關。"
      }
    },
    5: {
      keyword: "姊姊",
      questions: [
        "1. 討厭阿明嗎？",
        "2. 跟職業有關嗎？",
        "3. 是親生的嗎？",
        "4. 是童養媳嗎？"
      ],
      answers: {
        1: "否。討厭文具被拿走。",
        2: "否。姊姊在上小學。",
        3: "是。",
        4: "否。他們是親姐弟。"
      }
    },
    6: {
      keyword: "眼神",
      questions: [
        "1. 有擔憂嗎？",
        "2. 有鄙夷嗎？",
        "3. 有殺氣嗎？",
        "4. 有生氣嗎？"
      ],
      answers: {
        1: "是。姊姊知道爸爸對他有期待。",
        2: "否。她對弟弟好。",
        3: "否。有點討厭而已。",
        4: "有。『不要再拿了』她說。"
      }
    },
    7: {
      keyword: "還原故事問題",
      questions: [
        "1. 阿明撿的破爛有什麼共同的特性？\nＡ. 紙類\nＢ. 可以賣很多錢貼補家用\nＣ. 能讓爸爸更生氣\nＤ. 製作武器的原材料",
        "2. 爸爸打阿明的原因是？\nＡ. 毀損傢俱和房屋使其無法使用\nＢ. 酗酒\nＣ. 為了趕走不是親生的阿明\nＤ. 制止阿明繼續做某件事",
        "3. 姊姊和阿明的主要矛盾是？\nＡ. 搶文具\nＢ. 家事和農活過於繁重，相互推卸工作\nＣ. 偷錢\nＤ. 姊姊不想成為阿明的童養媳",
        "4. 阿明的特殊之處究竟是什麼？\nＡ. 一雙能從破爛中找出值錢物品的慧眼\nＢ. 如鋼鐵般扛打挨揍的身軀\nＣ. 愛畫畫的手\nＤ. 武器大師"
      ],
      answers: {
        1: "Ａ. 紙類",
        2: "Ｄ. 制止阿明繼續做某件事",
        3: "Ａ. 搶文具",
        4: "Ｃ. 愛畫畫的手"
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

  if (!userStates[userId]) {
    userStates[userId] = { mode: 'topic', currentTopic: null };
  }

  const state = userStates[userId];

  // 開始遊戲
  if (msg === '開始遊戲') {
    state.mode = 'topic';
    state.currentTopic = null;
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: storyData.intro
    });
  }

  // 主題選擇
  if (state.mode === 'topic' && /^[1-7]$/.test(msg)) {
    state.currentTopic = msg;
    state.mode = 'question';
    const topic = storyData.interactions[msg];
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你選擇的是「${topic.keyword}」請輸入題號查詢（或輸入 0 返回主題選單）：\n${topic.questions.join('\n')}`
    });
  }

  // 題號查詢回答階段
  if (state.mode === 'question') {
    if (msg === '0') {
      state.mode = 'topic';
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: storyData.intro
      });
    }
    const topic = storyData.interactions[state.currentTopic];
    const qId = parseInt(msg);
    if (!topic.answers[qId]) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '⚠️ 題號無效，請重新輸入。'
      });
    }
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `問題：「${topic.questions[qId - 1]}」\n答案：${topic.answers[qId]}\n\n請繼續輸入題號查詢，或輸入 0 返回主題選單。`
    });
  }

  // 未知狀態或格式錯誤
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '請輸入「開始遊戲」開始，或根據提示輸入數字選項。'
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

