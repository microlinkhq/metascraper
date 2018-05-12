'use strict'

const { getValue, titleize } = require('@metascraper/helpers')
const { isString } = require('lodash')

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const removeLocation = value => value.replace(REGEX_LOCATION, '')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return isString(value) && titleize(removeLocation(value), { capitalize: false })
}

/**
 * Rules.
 */

module.exports = () => ({
  description: [
    wrap($ => $('meta[property="og:description"]').attr('content')),
    wrap($ => $('meta[name="twitter:description"]').attr('content')),
    wrap($ => $('meta[name="description"]').attr('content')),
    wrap($ => $('meta[name="sailthru.description"]').attr('content')),
    wrap($ => $('meta[itemprop="description"]').attr('content')),
    wrap($ => $('#description').text()),
    wrap($ => getValue($, $('article > p'))),
    wrap($ => getValue($, $('[class="content"] > p'))),
    wrap($ => getValue($, $('[class*="content"] > p'))),
    wrap($ => getValue($, $('[class*="content"] p')))
  ]
})
