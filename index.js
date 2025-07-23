const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: 'cTOKJdSRlL8LYBgrQtKCB/DZ3ajAOHYN2aZyh3j+Gs4j6sK6lo78Um29Vo+W34RQi2jzRUecamad5II9RnKCMkZ5EeSBkb8TQTGbhOdU7dMuUXz9aMYvGnqQQ+GJqHd/NeRTggi5ZQPMpSPf8uy0iwdB04t89/1O/w1cDnyilFU=',
  channelSecret: '7c2ce056206edad1c9adb78946f446a7'
};

const app = express();
const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const replyText = 
`自從阿明被爸爸胖揍一頓之後就開始頻繁地撿破爛，
看見阿明這麼做，姊姊的眼神很是複雜。

請輸入以下關鍵字之一以深入提問：
🔸 阿明
🔸 爸爸
🔸 胖揍一頓
🔸 破爛
🔸 姊姊
🔸 眼神
🔸 還原問題`;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log('LINE Bot is running');
});
