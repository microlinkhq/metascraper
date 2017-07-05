'use strict'

const normalizeUrl = require('normalize-url')
const isString = require('lodash.isstring')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => $ => {
  let value = rule($)
  if (!isString(value)) return

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
