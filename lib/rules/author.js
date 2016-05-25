
import isUrl from 'is-url'
import toTitle from 'to-title-case'
import { meta, text } from '../create-rule'

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return async (window) => {
    let value = await rule(window)

    if (typeof value != 'string') return null
    if (isUrl(value)) return null
    if (value.includes('|')) return null

    // make it title case, since some sites have it in weird casing
    value = toTitle(value)

    // remove any extra "by" in the start of the string
    value = value.replace(/^\s*by\s*/i, '')

    // remove extra spaces that sometimes creep in
    value = value.replace(/\s+/, ' ')

    // don't pass back empty strings
    if (!value) value = null

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
  return async (window) => {
    const value = await rule(window)
    const regexp = /^\w+\s+\w+/
    if (!regexp.test(value)) return null
    return value
  }
}

/**
 * Rules.
 */

export default [
  wrap(meta('meta[property="article:author"]')),
  wrap(meta('meta[name="author"]')),
  wrap(meta('meta[name="sailthru.author"]')),
  wrap(text('[rel="author"]')),
  wrap(text('[itemprop*="author"] [itemprop="name"]')),
  wrap(text('[itemprop*="author"]')),
  wrap(meta('meta[property="book:author"]')),
  strict(wrap(text('a[class*="author"]'))),
  strict(wrap(text('[class*="author"] a'))),
  strict(wrap(text('[class*="author"] a:nth-child(2)'))),
  strict(wrap(text('[class*="author"]'))),
]
