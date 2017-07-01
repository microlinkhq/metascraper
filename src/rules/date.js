'use strict'

const isIso = require('is-isodate')
const chrono = require('chrono-node')

const REGEX_NUMBER = /^[0-9]+$/

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => $ => {
  let value = rule($)
  if (!value) return

  // remove whitespace for easier parsing
  value = value.trim()

  // convert isodates to restringify, because sometimes they are truncated
  if (isIso(value)) return new Date(value).toISOString()

  // parse number strings as milliseconds
  if (REGEX_NUMBER.test(value)) {
    const int = parseInt(value, 10)
    const date = new Date(int)
    return date.toISOString()
  }

  // try to parse with the built-in date parser
  const native = new Date(value)
  if (!isNaN(native.getTime())) return native.toISOString()

  // try to parse a complex date string
  const parsed = chrono.parseDate(value)
  if (parsed) return parsed.toISOString()
}

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="article:published_time"]').attr('content')),
  wrap($ => $('meta[name="dc.date"]').attr('content')),
  wrap($ => $('meta[name="DC.date"]').attr('content')),
  wrap($ => $('meta[name="dc.date.issued"]').attr('content')),
  wrap($ => $('meta[name="DC.date.issued"]').attr('content')),
  wrap($ => $('meta[name="dc.date.created"]').attr('content')),
  wrap($ => $('meta[name="DC.date.created"]').attr('content')),
  wrap($ => $('meta[name="DC.Date"]').attr('content')),
  wrap($ => $('meta[name="date"]').attr('content')),
  wrap($ => $('meta[name="dcterms.date"]').attr('content')),
  wrap($ => $('[itemprop="datePublished"]').attr('content')),
  wrap($ => $('time[itemprop*="pubDate"]').attr('datetime')),
  wrap($ => $('time[itemprop*="pubdate"]').attr('datetime')),
  wrap($ => $('[property*="dc:date"]').attr('content')),
  wrap($ => $('[property*="dc:created"]').attr('content')),
  wrap($ => $('time[datetime][pubdate]').attr('datetime')),
  wrap($ => $('meta[name="sailthru.date"]').attr('content')),
  wrap($ => $('meta[property="book:release_date"]').attr('content')),
  wrap($ => $('time[datetime]').attr('datetime')),
  wrap($ => $('[class*="byline"]').text()),
  wrap($ => $('[class*="dateline"]').text()),
  wrap($ => $('[class*="date"]').text()),
  wrap($ => $('[id*="date"]').text()),
  wrap($ => $('[class*="post-meta"]').text()),
  wrap(($, url) => {
    const regexp = /(\d{4}[-/]\d{2}[-/]\d{2})/
    const match = regexp.exec(url)
    if (!match) return

    const string = match[1]
    const date = new Date(string)
    return date.toISOString()
  }),
  wrap($ => {
    const text = $('[class*="byline"]').text()
    if (!text) return

    const regexp = /(\w+ \d{2},? \d{4})/
    const match = regexp.exec(text)
    if (!match) return

    const string = match[1]
    const date = new Date(string)
    return date.toISOString()
  })
]
