'use strict'

const condenseWhitespace = require('condense-whitespace')
const smartquotes = require('smartquotes')
const { isString, flow } = require('lodash')

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const removeLocation = value => value.replace(REGEX_LOCATION, '')

const sanetize = flow([
  // trim extra whitespace
  condenseWhitespace,
  // if it starts with a location, like articles sometimes do in the opening
  // paragraph, try to remove it
  removeLocation,
  smartquotes
])

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)

  if (!isString(value)) return
  return sanetize(value)
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
    wrap($ =>
      $('[class*="content"] > p')
        .first()
        .text()
    ),
    wrap($ =>
      $('[class*="content"] p')
        .first()
        .text()
    )
  ]
})
