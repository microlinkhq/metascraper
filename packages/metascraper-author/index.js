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
    wrap($ => $filter($, $('[itemprop*="author"] [itemprop="name"]'))),
    wrap($ => $filter($, $('[itemprop*="author"]'))),
    wrap($ => $filter($, $('[rel="author"]'))),
    strict(wrap($ => $filter($, $('a[class*="author"]')))),
    strict(wrap($ => $filter($, $('[class*="author"] a')))),
    strict(wrap($ => $filter($, $('a[href*="/author/"]')))),
    wrap($ => $filter($, $('a[class*="screenname"]'))),
    strict(wrap($ => $filter($, $('[class*="author"]')))),
    strict(wrap($ => $filter($, $('[class*="byline"]'))))
  ]
})
