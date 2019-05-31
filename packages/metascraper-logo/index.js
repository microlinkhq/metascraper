'use strict'

const { $jsonld, url: urlFn } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return urlFn(value, { url })
}

/**
 * Rules.
 */
module.exports = () => ({
  logo: [
    wrap($jsonld('publisher.logo.url')),
    wrap($jsonld('publisher.logo')),
    wrap($ => $('meta[property="og:logo"]').attr('content')),
    wrap($ => $('meta[itemprop="logo"]').attr('content')),
    wrap($ => $('img[itemprop="logo"]').attr('src'))
  ]
})
