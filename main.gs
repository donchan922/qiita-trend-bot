// QiitaのURL情報
var QIITA_BASE_URL = 'https://qiita.com'
var QIITA_TRENDS_URL = 'https://qiita.com/trend'

// Twitter認証処理
var twitter = TwitterApp.create()
function authorize() { twitter.authorize() }
function reset() { twitter.reset() }
function authCallback(request) { return twitter.authCallback(request) }

// Qiitaトレンド新着記事投稿処理
function postQiitaNewTrends() {
  var html = UrlFetchApp.fetch(QIITA_TRENDS_URL).getContentText()
  var items = Parser.data(html).from('{&quot;followingLikers').to('}}}').iterate()
  for (var i = 0; i < items.length; i++) {
    var isNewArrival = items[i].match(/isNewArrival&quot;:(.+?),/)[1]
    // 新着（newアイコン表示）記事のみ対象とする
    if (isNewArrival == 'false') {
      continue
    }
    var title = items[i].match(/title&quot;:&quot;(.+?)&quot;,/)[1]
    var uuid = items[i].match(/uuid&quot;:&quot;(.+?)&quot;,/)[1]
    var urlName = items[i].match(/urlName&quot;:&quot;(.+?)&quot;/)[1]
    var link = QIITA_BASE_URL + '/' + urlName + '/items/' + uuid
    var status = title + "\n" + link
    // Tweetする
    tweet(status)
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
    console.error(e)
  }
}