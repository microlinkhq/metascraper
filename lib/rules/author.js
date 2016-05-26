
const isUrl = require('is-url')
const toTitle = require('to-title-case')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return ($) => {
    let value = rule($)
    if (typeof value != 'string') return
    if (isUrl(value)) return
    if (value.includes('|')) return

    // remove any extra "by" in the start of the string
    value = value.replace(/^[\s\n]*by[\s\n]*/im, '')

    // remove any extra lines of text
    value = value.replace(/\n.*/m, '')

    // remove extra spaces that sometimes creep in
    value = value.replace(/\s+/g, ' ')

    // make it title case, since some sites have it in weird casing
    value = toTitle(value)

    return value
  }
}

/**
 * Enforce stricter matching for a `rule`.
 *
 * @param {Function} rule
 * @return {Function} stricter
 */

function strict(rule) {
  return ($) => {
    let value = rule($)
    const regexp = /^\w+\s+\w+/
    if (!regexp.test(value)) return
    return value
  }
}

/**
 * Rules.
 */

module.exports = [
  wrap(($) => $('meta[property="article:author"]').attr('content')),
  wrap(($) => $('meta[name="author"]').attr('content')),
  wrap(($) => $('meta[name="sailthru.author"]').attr('content')),
  wrap(($) => $('[rel="author"]').first().text()),
  wrap(($) => $('[itemprop*="author"] [itemprop="name"]').first().text()),
  wrap(($) => $('[itemprop*="author"]').first().text()),
  wrap(($) => $('meta[property="book:author"]').attr('content')),
  strict(wrap(($) => $('a[class*="author"]').first().text())),
  strict(wrap(($) => $('[class*="author"] a').first().text())),
  strict(wrap(($) => $('[class*="author"]').first().text())),
]
