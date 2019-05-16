'use strict'

const { $filter, url: urlFn, isString, isArray } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return urlFn(value, { url })
}

const findImageFromLd = ({ jsonLd, url }) => {
  const value = jsonLd.image
  if (isString(value)) {
    return urlFn(value, { url })
  }
  if (isArray(value) && value.length > 0 && value[0].url) {
    return urlFn(value[0].url, { url })
  }
  return null
}

const getSrc = el => el.attr('src')

/**
 * Rules.
 */
module.exports = () => ({
  image: [
    findImageFromLd,
    wrap($ => $('meta[property="og:image:secure_url"]').attr('content')),
    wrap($ => $('meta[property="og:image:url"]').attr('content')),
    wrap($ => $('meta[property="og:image"]').attr('content')),
    wrap($ => $('meta[name="twitter:image:src"]').attr('content')),
    wrap($ => $('meta[name="twitter:image"]').attr('content')),
    wrap($ => $('meta[itemprop="image"]').attr('content')),
    wrap($ => $filter($, $('article img[src]'), getSrc)),
    wrap($ => $filter($, $('#content img[src]'), getSrc)),
    wrap($ => $('img[alt*="author" i]').attr('src')),
    wrap($ => $('img[src]').attr('src'))
  ]
})
