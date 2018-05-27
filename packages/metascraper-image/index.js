'use strict'

const { getValue, getUrl, isUrl } = require('@metascraper/helpers')

const validator = (value, url) => isUrl(value) && getUrl(url, value)

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return validator(value, url)
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
    wrap($ => $('meta[itemprop="image"]').attr('content')),
    wrap($ => getValue($, $('article img[src]'), getSrc)),
    wrap($ => getValue($, $('#content img[src]'), getSrc)),
    wrap($ => $('img[alt*="author"]').attr('src')),
    wrap($ => $('img[src]').attr('src'))
  ]
})

module.exports.validator = validator
