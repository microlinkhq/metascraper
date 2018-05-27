'use strict'

const { getUrl, isUrl } = require('@metascraper/helpers')

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

module.exports.validator = validator
