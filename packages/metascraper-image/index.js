'use strict'

const { getValue, getUrl, isUrl } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return isUrl(value) && getUrl(url, value)
}

const getSrc = el => el.attr('src')

/**
 * Rules.
 */
module.exports = () => ({
  image: [
    wrap($ => $('meta[property="og:image:secure_url"]').attr('content')),
    wrap($ => $('meta[property="og:image:url"]').attr('content')),
    wrap($ => $('meta[property="og:image"]').attr('content')),
    wrap($ => $('meta[name="twitter:image:src"]').attr('content')),
    wrap($ => $('meta[name="twitter:image"]').attr('content')),
    wrap($ => $('meta[name="sailthru.image.thumb"]').attr('content')),
    wrap($ => $('meta[name="sailthru.image.full"]').attr('content')),
    wrap($ => $('meta[name="sailthru.image"]').attr('content')),
    wrap($ => getValue($, $('article img[src]'), getSrc)),
    wrap($ => getValue($, $('#content img[src]'), getSrc)),
    wrap($ => $('img[alt*="author"]').attr('src')),
    wrap($ => $('img[src]').attr('src'))
  ]
})
