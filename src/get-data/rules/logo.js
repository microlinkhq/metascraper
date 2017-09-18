'use strict'

const {isString} = require('lodash')
const {getUrl} = require('../util')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => (htmlDom, baseUrl) => {
  const url = rule(htmlDom)
  if (!isString(url)) return
  return getUrl(url, baseUrl)
}

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="og:logo"]').attr('content')),
  wrap($ => $('meta[itemprop="logo"]').attr('content')),
  wrap($ => $('img[src*="logo"]').attr('src')),
  wrap($ => $('img[class*="logo"]').attr('src'))
]
