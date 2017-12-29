'use strict'

const { isUrl, titleize } = require('@metascraper/helpers')
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

const getFirst = ($, collection) =>
  collection
    .filter((i, el) =>
      $(el)
        .text()
        .trim()
    )
    .first()
    .text()

/**
 * Rules.
 */

module.exports = () => ({
  author: [
    wrap($ => $('meta[property="author"]').attr('content')),
    wrap($ => $('meta[property="article:author"]').attr('content')),
    wrap($ => $('meta[name="author"]').attr('content')),
    wrap($ => $('meta[name="sailthru.author"]').attr('content')),
    wrap($ =>
      $('[rel="author"]')
        .first()
        .text()
    ),
    wrap($ =>
      $('[itemprop*="author"] [itemprop="name"]')
        .first()
        .text()
    ),
    wrap($ =>
      $('[itemprop*="author"]')
        .first()
        .text()
    ),
    wrap($ => $('meta[property="book:author"]').attr('content')),
    strict(
      wrap($ =>
        $('a[class*="author"]')
          .first()
          .text()
      )
    ),
    strict(
      wrap($ =>
        $('[class*="author"] a')
          .first()
          .text()
      )
    ),
    strict(wrap($ => getFirst($, $('a[href*="/author/"]')))),
    wrap($ =>
      $('a[class*="screenname"]')
        .first()
        .text()
    ),
    strict(
      wrap($ =>
        $('[class*="author"]')
          .first()
          .text()
      )
    ),
    strict(
      wrap($ =>
        $('[class*="byline"]')
          .first()
          .text()
      )
    ),
    wrap($ => getFirst($, $('.fullname'))),
    wrap($ => $('[class*="user-info"]').text())
  ]
})
