'use strict'

const { $jsonld, url: isUrl } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrapUrl = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return isUrl(value, { url })
}

/**
 * Rules.
 */
module.exports = () => ({
  logo: [
    wrapUrl($jsonld('publisher.logo.url')),
    wrapUrl($jsonld('publisher.logo')),
    wrapUrl($ => $('meta[property="og:logo"]').attr('content')),
    wrapUrl($ => $('meta[itemprop="logo"]').attr('content')),
    wrapUrl($ => $('img[itemprop="logo"]').attr('src'))
  ]
})
