const ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("ACCESSTOKEN");
const GYAZO_API_KEY = PropertiesService.getScriptProperties().getProperty("GYAZOAPIKEY");
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

/**
 * LINEからコンテンツを取得する
 * @param {String} messageId メッセージID
 */
function getLineContent(messageId) {
  try {
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`
    let options = {
      'method': 'get',
      'headers': {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    };
    return UrlFetchApp.fetch(url, options);
  } catch (e) {
    logSheet.appendRow([Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss'), 'LINEコンテンツ取得失敗', messageId])
  }
}

/**
 * gyazoに画像をアップロード
 * @param {blob} file - 画像ファイル
 * @return {string} url - 画像url
 */
function uploadGyazo(file) {
  try {
    const res = UrlFetchApp.fetch("https://upload.gyazo.com/api/upload", {
      method: "POST",
      'payload': {
        access_token: GYAZO_API_KEY,
        imagedata: file.getAs('image/jpeg')
      },
      muteHttpExceptions: true,
    })
    return JSON.parse(res.getContentText()).url
  } catch (e) {
    logSheet.appendRow([Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss'), 'アップロード失敗', e])
  }
}


//メッセージイベントの処理
 function messagefunc(event) {
   if(event.message.type === 'image'){
     const content = getLineContent(event.message.id);
     const imageUrl = uploadGyazo(content);
     exportPages(event.message.text, imageUrl);
     return;
   }
  exportPages(event.message.text, 'uuu');
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