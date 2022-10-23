const ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("ACCESSTOKEN");
function doPost(e) {
  for (let i = 0; i < JSON.parse(e.postData.contents).events.length; i++) {
    const event = JSON.parse(e.postData.contents).events[i];
    const message = eventHandle(event);
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

function eventHandle(event) {
  let message;
  switch (event.type) {
    case "message":
      message =  messagefunc(event);
      break;
    case "postback":
      message =  postbackFunc(event);
      break;
    case "follow":
      message =  followFunc(event);
      break;
    case "unfollow":
      message = unfolowFunc(event);
      break;
  }
  return message;
}
//メッセージイベントの処理
 function messagefunc(event) {
  exportPages(event.message.text)
  return { type: "text", text: event.message.text };
}
//ポストバックイベントの処理
 function postbackFunc(event) {
  return { type: "text", text: event.postback.data };
}
//友達登録時の処理
 function followFunc(event) {
  return { type: "text", text: "友達登録ありがとうございます!!" };
}
//友達解除後の処理
 function unfollowFunc() {
  return undefined;
}
