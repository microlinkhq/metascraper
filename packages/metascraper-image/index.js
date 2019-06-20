'use strict'

const { $jsonld, $filter, image } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return image(value, { url })
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
    wrap($jsonld('image.0.url')),
    wrap($jsonld('image.url')),
    wrap($jsonld('image.url')),
    wrap($jsonld('image')),
    wrap($ => $filter($, $('article img[src]'), getSrc)),
    wrap($ => $filter($, $('#content img[src]'), getSrc)),
    wrap($ => $('img[alt*="author" i]').attr('src')),
    wrap($ => $('img[src]').attr('src'))
  ]
})
