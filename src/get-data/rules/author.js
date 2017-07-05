'use strict'

const condenseWhitespace = require('condense-whitespace')
const isString = require('lodash.isstring')
const toTitle = require('to-title-case')
const urlRegex = require('url-regex')
const flow = require('lodash.flow')

const REGEX_BY = /^[\s\n]*by[\s\n]*/im
const REGEX_STRICT = /^\S+\s+\S+/

const isUrl = value => urlRegex().test(value)
const removeBy = value => value.replace(REGEX_BY, '')

const sanetize = flow([
  // trim extra whitespace
  condenseWhitespace,
  // remove any extra "by" in the start of the string
  removeBy,
  // make it title case, since some sites have it in weird casing
  toTitle
])

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => $ => {
  const value = rule($)

  if (!isString(value)) return
  if (isUrl(value)) return
  return sanetize(value)
}

/**
 * Enforce stricter matching for a `rule`.
 *
 * @param {Function} rule
 * @return {Function} stricter
 */

const strict = rule => $ => {
  const value = rule($)

  if (!REGEX_STRICT.test(value)) return
  return value
}

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="author"]').attr('content')),
  wrap($ => $('meta[property="article:author"]').attr('content')),
  wrap($ => $('meta[name="author"]').attr('content')),
  wrap($ => $('meta[name="sailthru.author"]').attr('content')),
  wrap($ => $('[rel="author"]').first().text()),
  wrap($ => $('[itemprop*="author"] [itemprop="name"]').first().text()),
  wrap($ => $('[itemprop*="author"]').first().text()),
  wrap($ => $('meta[property="book:author"]').attr('content')),
  strict(wrap($ => $('a[class*="author"]').first().text())),
  strict(wrap($ => $('[class*="author"] a').first().text())),
  strict(wrap($ => $('[class*="author"]').first().text())),
  strict(wrap($ => $('[class*="byline"]').text())),
  strict(wrap($ => $('a[href*="/author/"]').text()))
]
