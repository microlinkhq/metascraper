'use strict'

const { $filter, $jsonld, publisher, toRule } = require('@metascraper/helpers')

const REGEX_TITLE = /^.*?[-|]\s+(.*)$/

const toPublisher = toRule(publisher)

const getFromTitle = (text, regex = REGEX_TITLE) => {
  const matches = regex.exec(text)
  if (!matches) return false
  let result = matches[1]
  while (regex.test(result)) result = regex.exec(result)[1]
  return result
}

module.exports = () => ({
  publisher: [
    toPublisher($jsonld('publisher.name')),
    toPublisher($ => $('meta[property="og:site_name"]').prop('content')),
    toPublisher($ => $('meta[name*="application-name" i]').prop('content')),
    toPublisher($ => $('meta[name*="app-title" i]').prop('content')),
    toPublisher($ => $('meta[property*="app_name" i]').prop('content')),
    toPublisher($ => $('meta[name="publisher" i]').prop('content')),
    toPublisher($ => $('meta[name="twitter:app:name:iphone"]').prop('content')),
    toPublisher($ =>
      $('meta[property="twitter:app:name:iphone"]').prop('content')
    ),
    toPublisher($ => $('meta[name="twitter:app:name:ipad"]').prop('content')),
    toPublisher($ =>
      $('meta[property="twitter:app:name:ipad"]').prop('content')
    ),
    toPublisher($ =>
      $('meta[name="twitter:app:name:googleplay"]').prop('content')
    ),
    toPublisher($ =>
      $('meta[property="twitter:app:name:googleplay"]').prop('content')
    ),
    toPublisher($ => $filter($, $('#logo'))),
    toPublisher($ => $filter($, $('.logo'))),
    toPublisher($ => $filter($, $('a[class*="brand" i]'))),
    toPublisher($ => $filter($, $('[class*="brand" i]'))),
    toPublisher($ => $('[class*="logo" i] a img[alt]').prop('alt')),
    toPublisher($ => $('[class*="logo" i] img[alt]').prop('alt')),
    toPublisher($ => $filter($, $('title'), el => getFromTitle($filter.fn(el))))
  ]
})

module.exports.getFromTitle = getFromTitle
