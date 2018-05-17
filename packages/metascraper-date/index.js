'use strict'

const chrono = require('chrono-node')
const isIso = require('isostring')

const validator = value => {
  if (!value) return false

  // remove whitespace for easier parsing
  value = value.trim()

  // convert isodates to restringify, because sometimes they are truncated
  if (isIso(value)) return new Date(value).toISOString()

  // try to parse with the built-in date parser
  const native = new Date(value)
  if (!isNaN(native.getTime())) return native.toISOString()

  // try to parse a complex date string
  const parsed = chrono.parseDate(value)
  if (parsed) return parsed.toISOString()
}

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return validator(value)
}

/**
 * Rules.
 */

module.exports = () => ({
  date: [
    wrap($ => $('meta[property="article:published_time"]').attr('content')),
    wrap($ => $('meta[name="dc.date"]').attr('content')),
    wrap($ => $('meta[name="dc.date.issued"]').attr('content')),
    wrap($ => $('meta[name="dc.date.created"]').attr('content')),
    wrap($ => $('meta[name="date"]').attr('content')),
    wrap($ => $('meta[name="dcterms.date"]').attr('content')),
    wrap($ => $('[itemprop="datePublished"]').attr('content')),
    wrap($ => $('time[itemprop*="pubdate"]').attr('datetime')),
    wrap($ => $('[property*="dc:date"]').attr('content')),
    wrap($ => $('[property*="dc:created"]').attr('content')),
    wrap($ => $('time[datetime][pubdate]').attr('datetime')),
    wrap($ => $('meta[property="book:release_date"]').attr('content')),
    wrap($ => $('time[datetime]').attr('datetime')),
    wrap($ => $('[class*="byline"]').text()),
    wrap($ => $('[class*="dateline"]').text()),
    wrap($ => $('[id*="date"]').text()),
    wrap($ => $('[class*="date"]').text()),
    wrap($ => $('[id*="publish"]').text()),
    wrap($ => $('[class*="publish"]').text()),
    wrap($ => $('[id*="post-timestamp"]').text()),
    wrap($ => $('[class*="post-timestamp"]').text()),
    wrap($ => $('[id*="post-meta"]').text()),
    wrap($ => $('[class*="post-meta"]').text()),
    wrap($ => $('[id*="metadata"]').text()),
    wrap($ => $('[class*="metadata"]').text()),
    wrap($ => $('[id*="time"]').text()),
    wrap($ => $('[class*="time"]').text())
  ]
})

module.exports.validator = validator
