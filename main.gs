const logSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
//Scrapboxのuidを記入
const sid = PropertiesService.getScriptProperties().getProperty("SID");
//Scrapboxのプロジェクト名(https://scrapbox.io/:projectName)
const projectName = PropertiesService.getScriptProperties().getProperty("PROJECTNAME");

function getCookie() {
  return "connect.sid=" + sid;
}

function getToken() {
  const userInfoJSON = UrlFetchApp.fetch("https://scrapbox.io/api/users/me", {
    method: "get",
    headers: {
      "Cookie": getCookie(sid)
    }
  });
  console.log(JSON.parse(userInfoJSON))
  const userInfoData = JSON.parse(userInfoJSON);
  const csrfToken = userInfoData.csrfToken
  return csrfToken
}

/**
 * 書き込み関数
 * @param {string} title - タイトル
 * @param {string} imageUrl - 画像url
 */
const exportPages = (title, imageUrl) => {
  logSheet.appendRow([Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss'), 'エクスポート開始', title, imageUrl])
  try {
    const importPages = [{
      // titleとlinesは同じ値を入れておけば大丈夫
      "title": `${title}`,  
      "lines": [`${title}`, `[${imageUrl}]`  ]
    }]

    const form = FetchApp.createFormData();
    form.append(
      "import-file",
      Utilities.newBlob(JSON.stringify({ "pages": importPages }), "application/octet-stream")
    );
    const cookie = getCookie()

    const options = {
      "method": "POST",
      "headers": {
        "Accept": "application/json, text/plain, */*",
        "Cookie": cookie,
        "X-CSRF-TOKEN": getToken(),
      },
      muteHttpExceptions: true,
      "body": form
    };
    const response = FetchApp.fetch(`https://scrapbox.io/api/page-data/import/${projectName}.json`, options);
    logSheet.appendRow([Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss'), 'エクスポートリクエスト', response.getResponseCode(), response.getContentText()])
    return 'ok'
  } catch (e) {
    logSheet.appendRow([Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss'), 'エクスポート失敗', e])
    return 'error'
  }
}