'use strict'

const { getUrl, isUrl } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return isUrl(value) && getUrl(value, url)
}

/**
 * Rules.
 */

module.exports = () => ({
  url: [
    wrap($ => $('meta[property="og:url"]').attr('content')),
    wrap($ => $('meta[name="twitter:url"]').attr('content')),
    wrap($ => $('link[rel="canonical"]').attr('href')),
    wrap($ => $('link[rel="alternate"][hreflang="x-default"]').attr('href')),
    ({ url }) => url
  ]
})
