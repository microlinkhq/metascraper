'use strict'

const sanetizeUrl = require('normalize-url')
const isString = require('lodash.isstring')

const normalizeUrl = url => sanetizeUrl(url, {stripWWW: false})

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => (htmlDom, url) => {
  const value = rule(htmlDom)
  if (!isString(value)) return
  return normalizeUrl(value)
}

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="og:url"]').attr('content')),
  wrap($ => $('meta[name="twitter:url"]').attr('content')),
  wrap($ => $('link[rel="canonical"]').attr('href')),
  wrap($ => $('link[rel="alternate"][hreflang="x-default"]').attr('href')),
  ($, url) => isString(url) ? normalizeUrl(url) : null
]
