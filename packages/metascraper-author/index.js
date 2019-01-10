'use strict'

const { $filter, author } = require('@metascraper/helpers')

const REGEX_STRICT = /^\S+\s+\S+/

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return author(value)
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
    wrap($ => $filter($, $('[itemprop*="author" i] [itemprop="name"]'))),
    wrap($ => $filter($, $('[itemprop*="author" i]'))),
    wrap($ => $filter($, $('[rel="author"]'))),
    strict(wrap($ => $filter($, $('a[class*="author" i]')))),
    strict(wrap($ => $filter($, $('[class*="author" i] a')))),
    strict(wrap($ => $filter($, $('a[href*="/author/" i]')))),
    wrap($ => $filter($, $('a[class*="screenname" i]'))),
    strict(wrap($ => $filter($, $('[class*="author" i]')))),
    strict(wrap($ => $filter($, $('[class*="byline" i]'))))
  ]
})
