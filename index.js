const line = require('@line/bot-sdk');
const express = require('express');
const app = express();

const config = {
  channelAccessToken: 'cTOKJdSRlL8LYBgrQtKCB/DZ3ajAOHYN2aZyh3j+Gs4j6sK6lo78Um29Vo+W34RQi2jzRUecamad5II9RnKCMkZ5EeSBkb8TQTGbhOdU7dMuUXz9aMYvGnqQQ+GJqHd/NeRTggi5ZQPMpSPf8uy0iwdB04t89/1O/w1cDnyilFU=',
  channelSecret: '7c2ce056206edad1c9adb78946f446a7'
};

const client = new line.Client(config);

const mainPrompt = `題幹：
自從阿明被爸爸胖揍一頓之後就開始頻繁地撿破爛，
看見阿明這麼做，姊姊的眼神很是複雜。

可互動關鍵字：
👉 阿明、爸爸、破爛、姊姊、眼神
請輸入其中一個關鍵詞開始探索。`;

const questionSets = {
  "阿明": [
    "Q1. 阿明是小孩嗎？",
    "Q2. 阿明的個性愛記仇且有仇必報嗎？",
    "Q3. 阿明天性頑劣嗎？",
    "Q4. 阿明相較於普通孩子有特殊之處嗎？",
    "Q5. 阿明挨打後的行為是故意惹爸爸生氣嗎？"
  ],
  "爸爸": [
    "Q1. 跟爸爸的職業有關嗎？",
    "Q2. 爸爸本身脾氣暴躁嗎？",
    "Q3. 爸爸討厭阿明嗎？",
    "Q4. 爸爸有酗酒嗎？",
    "Q5. 爸爸看不起阿明嗎？",
    "Q6. 爸爸真的是親生父親嗎？"
  ],
  "破爛": [
    "Q1. 這些破爛可以賣錢嗎？",
    "Q2. 這些破爛會放在家裡嗎？",
    "Q3. 這些破爛可以做其他用途嗎？",
    "Q4. 這些破爛可以傷害別人嗎？",
    "Q5. 這些破爛經過加工可以成為武器嗎？"
  ],
  "姊姊": [
    "Q1. 姊姊討厭阿明嗎？",
    "Q2. 跟姊姊的職業有關嗎？",
    "Q3. 姊姊是爸爸親生的嗎？",
    "Q4. 姊姊是童養媳嗎？"
  ],
  "眼神": [
    "Q1. 眼神中有擔憂嗎？",
    "Q2. 眼神中有鄙夷嗎？",
    "Q3. 眼神中有想殺死弟弟的殺氣嗎？",
    "Q4. 眼神中有生氣嗎？"
  ]
};

const questionAnswers = {
  "阿明 Q1": "Ａ是。再幾年才會上小學。",
  "阿明 Q2": "Ａ否。",
  "阿明 Q3": "Ａ否。他是個會幫家裡幹農活做家務的乖孩子。",
  "阿明 Q4": "Ａ是。他特別喜歡做一件事，而且在這件事上有天份！",
  "阿明 Q5": "Ａ否。恰好相反，是為了讓以後爸爸不要再不開心了。",

  "爸爸 Q1": "Ａ否。爸爸只是個貧困偏鄉茶農，認為好好讀書才有前途。",
  "爸爸 Q2": "Ａ否。爸爸生氣都有原因。",
  "爸爸 Q3": "Ａ否。阿明作為家中長子，爸爸對他寄予厚望。",
  "爸爸 Q4": "Ａ否。認真工作賺錢養家的傳統好爸爸。",
  "爸爸 Q5": "Ａ否。重男輕女的傳統老爸，對於兒子阿明，就是因為重視才要重重責打。",
  "爸爸 Q6": "Ａ是。絕對是親生的，不是親生的誰管他啊？",

  "破爛 Q1": "Ａ是。但不值幾個錢。",
  "破爛 Q2": "Ａ是。但“放在家裡“不是阿明撿的主要目的。",
  "破爛 Q3": "Ａ是。這似乎與阿明的特殊之處有關。",
  "破爛 Q4": "Ａ否。不具有任何危險性，甚至風輕輕一吹可能就飄走了。",
  "破爛 Q5": "Ａ與此無關。即使可以經過加工成為武器，也與阿明的使用方式無關。",

  "姊姊 Q1": "Ａ否。姊姊討厭的是學校發的文具只有一套，但一直被拿走。",
  "姊姊 Q2": "Ａ否。姊姊目前上小學了，阿明還沒上學。",
  "姊姊 Q3": "Ａ是。",
  "姊姊 Q4": "Ａ否。你在想什麼！姊姊和阿明可是親姐弟！",

  "眼神 Q1": "Ａ是。姊姊知道爸爸對阿明寄予厚望，可是阿明卻做了些不務正業的事。",
  "眼神 Q2": "Ａ否。家中從小教育姊姊要讓著弟弟，所以姊姊也學著大人對弟弟好，看重弟弟。",
  "眼神 Q3": "Ａ否。有點討厭而已。",
  "眼神 Q4": "Ａ有。「不要再拿了！」姊姊說。"
};

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const msg = event.message.text.trim();

  if (msg === "開始遊戲") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: mainPrompt
    });
  }

  if (questionSets[msg]) {
    const list = questionSets[msg].join('\n');
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `你選擇了「${msg}」，請輸入題號查看答案：\n${list}\n\n例如輸入：${msg} Q1`
    });
  }

  if (questionAnswers[msg]) {
    const answer = questionAnswers[msg];
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: answer
      },
      {
        type: "text",
        text: mainPrompt
      }
    ]);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "請輸入「開始遊戲」來開始互動，或輸入關鍵詞如「阿明」來查看問題列表。"
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log('server started');
});

