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
  amphtml: [
    wrapUrl($ => $('link[rel="amphtml"]').attr('href'))
  ]
})
