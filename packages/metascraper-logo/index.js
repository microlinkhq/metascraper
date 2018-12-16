'use strict'

const { url: urlFn } = require('@metascraper/helpers')

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

/**
 * Rules.
 */
module.exports = () => ({
  logo: [
    wrap($ => $('meta[property="og:logo"]').attr('content')),
    wrap($ => $('meta[itemprop="logo"]').attr('content')),
    wrap($ => $('img[itemprop="logo"]').attr('src'))
  ]
})
