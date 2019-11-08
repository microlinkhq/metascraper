'use strict'

const { $jsonld, publisher, toRule } = require('@metascraper/helpers')

const REGEX_RSS = /^(.*?)\s[-|]\satom$/i
const REGEX_TITLE = /^.*?[-|]\s+(.*)$/

const toPublisher = toRule(publisher)

const getFromTitle = (text, regex) => {
  const matches = regex.exec(text)
  if (!matches) return false
  let result = matches[1]
  while (regex.test(result)) result = regex.exec(result)[1]
  return result
}

module.exports = () => ({
  publisher: [
    toPublisher($jsonld('publisher.name')),
    toPublisher($ => $('meta[property="og:site_name"]').attr('content')),
    toPublisher($ => $('meta[name*="application-name" i]').attr('content')),
    toPublisher($ => $('meta[property="al:android:app_name"]').attr('content')),
    toPublisher($ => $('meta[property="al:iphone:app_name"]').attr('content')),
    toPublisher($ => $('meta[property="al:ipad:app_name"]').attr('content')),
    toPublisher($ => $('meta[name="publisher" i]').attr('content')),
    toPublisher($ => $('meta[name="twitter:app:name:iphone"]').attr('content')),
    toPublisher($ => $('meta[name="twitter:app:name:ipad"]').attr('content')),
    toPublisher($ =>
      $('meta[name="twitter:app:name:googleplay"]').attr('content')
    ),
    toPublisher($ => $('#logo').text()),
    toPublisher($ => $('.logo').text()),
    toPublisher($ => $('a[class*="brand" i]').text()),
    toPublisher($ => $('[class*="brand" i]').text()),
    toPublisher($ => $('[class*="logo" i] a img[alt]').attr('alt')),
    toPublisher($ => $('[class*="logo" i] img[alt]').attr('alt')),
    toPublisher($ => getFromTitle($('title').text(), REGEX_TITLE)),
    toPublisher($ =>
      getFromTitle($('link[type*="xml" i]').attr('title'), REGEX_RSS)
    )
  ]
})
