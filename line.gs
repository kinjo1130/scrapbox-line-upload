const ACCESS_TOKEN = "";
async function doPost(e) {
  for (let i = 0; i < JSON.parse(e.postData.contents).events.length; i++) {
    const event = JSON.parse(e.postData.contents).events[i];
    const message = await eventHandle(event);
    //応答するメッセージがあった場合
    if (message !== undefined) {
      const replyToken = event.replyToken;
      const replyUrl = "https://api.line.me/v2/bot/message/reply";
      UrlFetchApp.fetch(replyUrl, {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: "Bearer " + ACCESS_TOKEN,
        },
        method: "post",
        payload: JSON.stringify({
          replyToken: replyToken,
          messages: [message],
        }),
      });
    }
  }
  return ContentService.createTextOutput(
    JSON.stringify({ content: "post ok" })
  ).setMimeType(ContentService.MimeType.JSON);
}

async function eventHandle(event) {
  let message;
  switch (event.type) {
    case "message":
      message = await messagefunc(event);
      break;
    case "postback":
      message = await postbackFunc(event);
      break;
    case "follow":
      message = await followFunc(event);
      break;
    case "unfollow":
      message = unfolowFunc(event);
      break;
  }
  return message;
}
//メッセージイベントの処理
async function messagefunc(event) {
  await exportPages(event.message.text)
  return { type: "text", text: event.message.text };
}
//ポストバックイベントの処理
async function postbackFunc(event) {
  return { type: "text", text: event.postback.data };
}
//友達登録時の処理
async function followFunc(event) {
  return { type: "text", text: "友達登録ありがとうございます!!" };
}
//友達解除後の処理
async function unfollowFunc() {
  return undefined;
}
