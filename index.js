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
        return reply(event, passed ? '🎉 恭喜你正確還原整個故事！故事是《魯冰花》第一章中的這個段落：說起畫畫，再沒有使弟弟更喜歡的事情了。茶妹記得六年前入學後有了蠟筆、圖紙等東西，從那時候起，弟弟就懂得了有件叫做「畫畫」這麼回事。那時他才四歲，見了東西就要，而且到了手就一定要玩個夠，非到那東西支離破碎不肯放手。特別是她那盒八枝裝的蠟筆，每次被看見就吵著要一枝。起始是撕下日曆來塗，到後來，牆壁、地面上、桌椅上，到處都要畫上那些圓圓方方的古怪圖樣。爸爸有一次氣得捉住他，狠狠地揍了一頓屁股，他這才不敢再亂畫。弟弟也真夠聰明，那以後看到了 紙張之類——如買東西回來時的包裝紙、 紙袋等，或者在馬路上揀到的爛紙，他都要細心存下來，弄平，收藏，有了蠟筆就畫。如今想起來，那時的弟弟雖然可愛，但又是怎樣地使她傷心啊。她剛入學，眼看著那樣重要的東西——她那時只覺得不管是鉛筆嘍、橡皮嘍、筆盒、墊板等等，沒有一樣不是挺重要的——卻教弟弟一枝接一枝給蹧蹋。爸爸媽媽又那樣袒他，不給他就要挨罵挨打。她不曉得為這些流了多少眼淚。沒法，她只好把弟弟玩膩丟下的蠟筆頭兒揀起來用。!' : '😢 很遺憾，你回答錯了幾題，請再試一次。輸入 7 重來結局挑戰或輸入 0 回主題選單。');
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

