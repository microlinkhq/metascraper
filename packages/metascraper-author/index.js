'use strict'

const { getValue, isUrl, titleize } = require('@metascraper/helpers')
const { isString } = require('lodash')

const REGEX_STRICT = /^\S+\s+\S+/

const validator = value => (
  isString(value) &&
  !isUrl(value, {relative: false}) &&
  titleize(value, {removeBy: true})
)

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
    wrap($ => $('meta[name="author"]').attr('content')),
    wrap($ => $('meta[property="author"]').attr('content')),
    wrap($ => $('meta[property="article:author"]').attr('content')),
    wrap($ => getValue($, $('[itemprop*="author"] [itemprop="name"]'))),
    wrap($ => getValue($, $('[itemprop*="author"]'))),
    wrap($ => getValue($, $('[rel="author"]'))),
    strict(wrap($ => getValue($, $('a[class*="author"]')))),
    strict(wrap($ => getValue($, $('[class*="author"] a')))),
    strict(wrap($ => getValue($, $('a[href*="/author/"]')))),
    wrap($ => getValue($, $('a[class*="screenname"]'))),
    strict(wrap($ => getValue($, $('[class*="author"]')))),
    strict(wrap($ => getValue($, $('[class*="byline"]'))))
  ]
})

module.exports.validator = validator
