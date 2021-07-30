'use strict'

const { $filter, $jsonld, publisher, toRule } = require('@metascraper/helpers')

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
    toPublisher($ => $('meta[name*="app-title" i]').attr('content')),
    toPublisher($ => $('meta[property*="app_name" i]').attr('content')),
    toPublisher($ => $('meta[name="publisher" i]').attr('content')),
    toPublisher($ => $('meta[name="twitter:app:name:iphone"]').attr('content')),
    toPublisher($ =>
      $('meta[property="twitter:app:name:iphone"]').attr('content')
    ),
    toPublisher($ => $('meta[name="twitter:app:name:ipad"]').attr('content')),
    toPublisher($ =>
      $('meta[property="twitter:app:name:ipad"]').attr('content')
    ),
    toPublisher($ =>
      $('meta[name="twitter:app:name:googleplay"]').attr('content')
    ),
    toPublisher($ =>
      $('meta[property="twitter:app:name:googleplay"]').attr('content')
    ),
    toPublisher($ => $filter($, $('#logo'))),
    toPublisher($ => $filter($, $('.logo'))),
    toPublisher($ => $filter($, $('a[class*="brand" i]'))),
    toPublisher($ => $filter($, $('[class*="brand" i]'))),
    toPublisher($ => $('[class*="logo" i] a img[alt]').attr('alt')),
    toPublisher($ => $('[class*="logo" i] img[alt]').attr('alt')),
    toPublisher($ =>
      $filter($, $('title'), el => getFromTitle($filter.fn(el), REGEX_TITLE))
    )
  ]
})
