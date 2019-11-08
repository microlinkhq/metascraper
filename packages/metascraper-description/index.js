'use strict'

const { $jsonld, description } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrapRule = opts => rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return description(value, opts)
}

/**
 * Rules.
 */

module.exports = opts => {
  const toDescription = wrapRule(opts)
  return {
    description: [
      toDescription($jsonld('description')),
      toDescription($ => $('meta[property="og:description"]').attr('content')),
      toDescription($ => $('meta[name="twitter:description"]').attr('content')),
      toDescription($ => $('meta[name="description"]').attr('content')),
      toDescription($ => $('meta[itemprop="description"]').attr('content')),
      toDescription($jsonld('articleBody'))
    ]
  }
}
