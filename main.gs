// QiitaのURL情報
var QIITA_URL = 'https://qiita.com'

// Twitter認証処理
var twitter = TwitterApp.create()
function authorize() { twitter.authorize() }
function reset() { twitter.reset() }
function authCallback(request) { return twitter.authCallback(request) }

// Qiitaトレンド新着記事投稿処理
function postQiitaNewTrends() {
  var html = UrlFetchApp.fetch(QIITA_URL).getContentText()
  var isNewArrivals = Parser.data(html).from('"isNewArrival":').to(',').iterate()
  var items = Parser.data(html).from('"node":').to('}}').iterate()

  for (var i = 0; i < isNewArrivals.length; i++) {
    // 新着（newアイコン表示）記事のみ対象とする
    if (isNewArrivals[i] == 'false') {
      continue
    }
    if (items[i].match(/"title":"(.+?)",/) === null || items[i].match(/"linkUrl":"(.+?)",/) === null) {
      continue
    }
    var title = items[i].match(/"title":"(.+?)",/)[1]
    var linkUrl = items[i].match(/"linkUrl":"(.+?)",/)[1]
    var status = unEscapeHTML(title) + " " + linkUrl
    // Tweetする
    tweet(decodeURIComponent(status))
  }
}

// Tweet処理
function tweet(status) {
  try {
    twitter.post('statuses/update', { status: status })
  } catch (e) {
    // Tweet重複のエラーは握りつぶす
    if (e.message.indexOf('Status is a duplicate.') != -1) {
      return
    }
    // それ以外のエラーはログ出力する
    Logger.log(e.message);
  }
}

var unEscapeHTML = function (str) {
  return str.replace(/(&lt;)/g, '<')
            .replace(/(&gt;)/g, '>')
            .replace(/(\\&quot;)/g, '"')
            .replace(/(\\")/g, '"')
            .replace(/(&quot;)/g, '"')
            .replace(/(&#39;)/g, "'")
            .replace(/(&amp;)/g, '&')
            .replace(/(\\u0026)/g, '&')
            .replace(/(\\b)/g, '')
            .replace(/(\\u003c)/g, '<')
            .replace(/(\\u003e)/g, '>')
}

