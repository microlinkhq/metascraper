'use strict'

const normalizeUrl = require('normalize-url')
const isString = require('lodash.isstring')
const urlRegex = require('url-regex')

const isUrl = value => urlRegex().test(value)

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => $ => {
  let value = rule($)
  if (!isString(value)) return

  // make sure it's a url
  value = value.trim()
  if (!isUrl(value)) return

  return normalizeUrl(value, {
    stripWWW: false
  })
}

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="og:url"]').attr('content')),
  wrap($ => $('meta[name="twitter:url"]').attr('content')),
  wrap($ => $('link[rel="canonical"]').attr('href')),
  wrap(($, url) => url)
]
