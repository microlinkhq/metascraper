'use strict'

const { isString } = require('lodash')
const condenseWhitespace = require('condense-whitespace')

const REGEX_RSS = /^(.*?)\s[-|]\satom$/i
const REGEX_TITLE = /^.*?\|\s+(.*)$/

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return isString(value) && condenseWhitespace(value)
}

/**
 * Rules.
 */

module.exports = () => ({
  publisher: [
    wrap($ => $('meta[property="og:site_name"]').attr('content')),
    wrap($ => $('meta[name="application-name"]').attr('content')),
    wrap($ => $('meta[property="al:android:app_name"]').attr('content')),
    wrap($ => $('meta[property="al:iphone:app_name"]').attr('content')),
    wrap($ => $('meta[property="al:ipad:app_name"]').attr('content')),
    wrap($ => $('meta[name="publisher"]').attr('content')),
    wrap($ => $('meta[name="twitter:app:name:iphone"]').attr('content')),
    wrap($ => $('meta[name="twitter:app:name:ipad"]').attr('content')),
    wrap($ => $('meta[name="twitter:app:name:googleplay"]').attr('content')),
    wrap($ => $('#logo').text()),
    wrap($ => $('.logo').text()),
    wrap($ => $('a[class*="brand"]').text()),
    wrap($ => $('[class*="brand"]').text()),
    wrap($ => $('[class*="logo"] a img[alt]').attr('alt')),
    wrap($ => $('[class*="logo"] img[alt]').attr('alt')),
    wrap($ => {
      const title = $('title')
        .text()
        .trim()
      const matches = REGEX_TITLE.exec(title)
      if (!matches) return
      return matches[1]
    }),
    wrap($ =>
      $('[itemtype="http://schema.org/Blog"] [itemprop="name"]').attr('content')
    ),
    wrap($ => {
      const desc = $('link[rel="alternate"][type="application/atom+xml"]').attr(
        'title'
      )
      const matches = REGEX_RSS.exec(desc)
      if (!matches) return
      return matches[1]
    })
  ]
})
