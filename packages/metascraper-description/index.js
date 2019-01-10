'use strict'

const { $filter, description } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return description(value)
}

/**
 * Rules.
 */

module.exports = () => ({
  description: [
    wrap($ => $('meta[property="og:description"]').attr('content')),
    wrap($ => $('meta[name="twitter:description"]').attr('content')),
    wrap($ => $('meta[name="description"]').attr('content')),
    wrap($ => $('meta[itemprop="description"]').attr('content')),
    wrap($ => $('#description').text()),
    wrap($ => $filter($, $('[class*="content" i] > p'))),
    wrap($ => $filter($, $('[class*="content" i] p')))
  ]
})
