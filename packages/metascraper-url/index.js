'use strict'

const { url: isUrl } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrapUrl = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return isUrl(value, { url })
}

/**
 * Rules.
 */

module.exports = () => ({
  url: [
    wrapUrl($ => $('meta[property="og:url"]').attr('content')),
    wrapUrl($ => $('meta[name="twitter:url"]').attr('content')),
    wrapUrl($ => $('link[rel="canonical"]').attr('href')),
    wrapUrl($ => $('link[rel="alternate"][hreflang="x-default"]').attr('href')),
    ({ url }) => url
  ]
})
