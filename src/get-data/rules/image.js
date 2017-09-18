'use strict'

const {getUrl} = require('../util')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => (htmlDom, baseUrl) => {
  const url = rule(htmlDom)
  if (!url) return
  return getUrl(url, baseUrl)
}

/**
 * Rules.
 */
module.exports = [
  wrap($ => $('meta[property="og:image:secure_url"]').attr('content')),
  wrap($ => $('meta[property="og:image:url"]').attr('content')),
  wrap($ => $('meta[property="og:image"]').attr('content')),
  wrap($ => $('meta[name="twitter:image"]').attr('content')),
  wrap($ => $('meta[property="twitter:image"]').attr('content')),
  wrap($ => $('meta[name="twitter:image:src"]').attr('content')),
  wrap($ => $('meta[property="twitter:image:src"]').attr('content')),
  wrap($ => $('meta[name="sailthru.image"]').attr('content')),
  wrap($ => $('meta[name="sailthru.image.full"]').attr('content')),
  wrap($ => $('meta[name="sailthru.image.thumb"]').attr('content')),
  wrap($ => $('article img[src]').first().attr('src')),
  wrap($ => $('#content img[src]').first().attr('src')),
  wrap($ => $('img[alt*="author"]').attr('src')),
  wrap($ => $('img[src]').attr('src'))
]
