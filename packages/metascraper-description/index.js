'use strict'

const { $jsonld, description } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return description(value)
}

/**
 * Rules.
 */

module.exports = () => ({
  description: [
    wrap($jsonld('description')),
    wrap($ => $('meta[property="og:description"]').attr('content')),
    wrap($ => $('meta[name="twitter:description"]').attr('content')),
    wrap($ => $('meta[name="description"]').attr('content')),
    wrap($ => $('meta[itemprop="description"]').attr('content')),
    wrap($jsonld('articleBody'))
  ]
})
