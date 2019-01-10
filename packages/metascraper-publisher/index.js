'use strict'

const { publisher } = require('@metascraper/helpers')

const REGEX_RSS = /^(.*?)\s[-|]\satom$/i
const REGEX_TITLE = /^.*?[-|]\s+(.*)$/

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return publisher(value)
}

const getFromTitle = (text, regex) => {
  const matches = regex.exec(text)
  if (!matches) return false
  let result = matches[1]
  while (regex.test(result)) result = regex.exec(result)[1]
  return result
}

/**
 * Rules.
 */

module.exports = () => ({
  publisher: [
    wrap($ => $('meta[property="og:site_name"]').attr('content')),
    wrap($ => $('meta[name*="application-name" i]').attr('content')),
    wrap($ => $('meta[property="al:android:app_name"]').attr('content')),
    wrap($ => $('meta[property="al:iphone:app_name"]').attr('content')),
    wrap($ => $('meta[property="al:ipad:app_name"]').attr('content')),
    wrap($ => $('meta[name="publisher" i]').attr('content')),
    wrap($ => $('meta[name="twitter:app:name:iphone"]').attr('content')),
    wrap($ => $('meta[name="twitter:app:name:ipad"]').attr('content')),
    wrap($ => $('meta[name="twitter:app:name:googleplay"]').attr('content')),
    wrap($ => $('#logo').text()),
    wrap($ => $('.logo').text()),
    wrap($ => $('a[class*="brand" i]').text()),
    wrap($ => $('[class*="brand" i]').text()),
    wrap($ => $('[class*="logo" i] a img[alt]').attr('alt')),
    wrap($ => $('[class*="logo" i] img[alt]').attr('alt')),
    wrap($ => getFromTitle($('title').text(), REGEX_TITLE)),
    wrap($ => getFromTitle($('link[type*="xml" i]').attr('title'), REGEX_RSS))
  ]
})
