'use strict'

const { getValue, isUrl, titleize } = require('@metascraper/helpers')
const { isString } = require('lodash')

const REGEX_BY = /^[\s\n]*by|@[\s\n]*/im
const REGEX_STRICT = /^\S+\s+\S+/

const removeBy = value => value.replace(REGEX_BY, '')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return isString(value) && !isUrl(value, {relative: false}) && titleize(removeBy(value))
}

/**
 * Enforce stricter matching for a `rule`.
 *
 * @param {Function} rule
 * @return {Function} stricter
 */

const strict = rule => $ => {
  const value = rule($)
  return REGEX_STRICT.test(value) && value
}

/**
 * Rules.
 */

module.exports = () => ({
  author: [
    wrap($ => $('meta[property="author"]').attr('content')),
    wrap($ => $('meta[property="article:author"]').attr('content')),
    wrap($ => $('meta[name="author"]').attr('content')),
    wrap($ => $('meta[name="sailthru.author"]').attr('content')),
    wrap($ => getValue($, $('[rel="author"]'))),
    wrap($ => getValue($, $('[itemprop*="author"] [itemprop="name"]'))),
    wrap($ => getValue($, $('[itemprop*="author"]'))),
    wrap($ => $('meta[property="book:author"]').attr('content')),
    strict(wrap($ => getValue($, $('a[class*="author"]')))),
    strict(wrap($ => getValue($, $('[class*="author"] a')))),
    strict(wrap($ => getValue($, $('a[href*="/author/"]')))),
    wrap($ => getValue($, $('a[class*="screenname"]'))),
    strict(wrap($ => getValue($, $('[class*="author"]')))),
    wrap($ => $('#owner-name').text()),
    wrap($ => $('#channel-title').text()),
    wrap($ => getValue($, $('[class*="user-info"]'))),
    strict(wrap($ => getValue($, $('[class*="byline"]'))))
  ]
})
