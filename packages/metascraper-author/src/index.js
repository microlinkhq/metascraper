'use strict'

const {
  $jsonld,
  $filter,
  toRule,
  date,
  author
} = require('@metascraper/helpers')

const REGEX_STRICT = /^\S+\s+\S+/

const toAuthor = toRule(author)

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

module.exports = () => {
  const rules = {
    author: [
      toAuthor($jsonld('author.name')),
      toAuthor($jsonld('brand.name')),
      toAuthor($ => $('meta[name="author"]').attr('content')),
      toAuthor($ => $('meta[property="article:author"]').attr('content')),
      toAuthor($ => $filter($, $('[itemprop*="author" i] [itemprop="name"]'))),
      toAuthor($ => $filter($, $('[itemprop*="author" i]'))),
      toAuthor($ => $filter($, $('[rel="author"]'))),
      strict(toAuthor($ => $filter($, $('a[class*="author" i]')))),
      strict(toAuthor($ => $filter($, $('[class*="author" i] a')))),
      strict(toAuthor($ => $filter($, $('a[href*="/author/" i]')))),
      toAuthor($ => $filter($, $('a[class*="screenname" i]'))),
      strict(toAuthor($ => $filter($, $('[class*="author" i]')))),
      strict(
        toAuthor($ =>
          $filter($, $('[class*="byline" i]'), el => {
            const value = $filter.fn(el)
            return !date(value) && value
          })
        )
      )
    ]
  }

  rules.pkgName = 'metascraper-author'

  return rules
}
