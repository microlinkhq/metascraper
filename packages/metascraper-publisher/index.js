'use strict'

const { isString } = require('lodash')
const condenseWhitespace = require('condense-whitespace')

const REGEX_RSS = /^(.*?)\s[-|]\satom$/i
const REGEX_TITLE = /^.*?\|\s+(.*)$/

const validator = value => isString(value) && condenseWhitespace(value)

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return validator(value)
}

const getFromTitle = (text, regex) => {
  const matches = regex.exec(text)
  return matches ? matches[1] : false
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
    wrap($ => getFromTitle($('title').text(), REGEX_TITLE)),
    wrap($ => getFromTitle($('link[type*="xml"]').attr('title'), REGEX_RSS))
  ]
})

module.exports.validator = validator
