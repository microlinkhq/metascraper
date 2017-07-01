'use strict'

const condenseWhitespace = require('condense-whitespace')
const isString = require('lodash.isstring')
const flow = require('lodash.flow')

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const removeLocation = value => value.replace(REGEX_LOCATION, '')

const sanetize = flow([
  // trim extra whitespace
  condenseWhitespace,
  // if it starts with a location, like articles sometimes do in the opening
  // paragraph, try to remove it
  removeLocation
])

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => $ => {
  let value = rule($)

  if (!isString(value)) return
  return sanetize(value)
}

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="og:description"]').attr('content')),
  wrap($ => $('meta[name="twitter:description"]').attr('content')),
  wrap($ => $('meta[name="description"]').attr('content')),
  wrap($ => $('meta[name="sailthru.description"]').attr('content')),
  wrap($ => $('meta[itemprop="description"]').attr('content')),
  wrap($ => $('.post-content p').first().text()),
  wrap($ => $('.entry-content p').first().text()),
  wrap($ => $('article p').first().text())
]
