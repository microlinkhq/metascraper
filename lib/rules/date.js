
let isIso = require('is-isodate')
let chrono = require('chrono-node')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return ($) => {
    let value = rule($)
    if (!value) return

    // remove whitespace for easier parsing
    value = value.trim()

    // convert isodates to restringify, because sometimes they are truncated
    if (isIso(value)) return new Date(value).toISOString()

    // parse number strings as milliseconds
    if (/^[0-9]+$/.test(value)) {
      let int = parseInt(value, 10)
      let date = new Date(int)
      return date.toISOString()
    }

    // try to parse with the built-in date parser
    let native = new Date(value)
    if (!isNaN(native.getTime())) return native.toISOString()

    // try to parse a complex date string
    let parsed = chrono.parseDate(value)
    if (parsed) return parsed.toISOString()
  }
}

/**
 * Rules.
 */

module.exports = [
  wrap(($) => $('meta[property="article:published_time"]').attr('content')),
  wrap(($) => $('meta[name="dc.date"]').attr('content')),
  wrap(($) => $('meta[name="DC.date"]').attr('content')),
  wrap(($) => $('meta[name="dc.date.issued"]').attr('content')),
  wrap(($) => $('meta[name="DC.date.issued"]').attr('content')),
  wrap(($) => $('meta[name="dc.date.created"]').attr('content')),
  wrap(($) => $('meta[name="DC.date.created"]').attr('content')),
  wrap(($) => $('meta[name="DC.Date"]').attr('content')),
  wrap(($) => $('meta[name="date"]').attr('content')),
  wrap(($) => $('meta[name="dcterms.date"]').attr('content')),
  wrap(($) => $('[itemprop="datePublished"]').attr('content')),
  wrap(($) => $('time[itemprop*="pubDate"]').attr('datetime')),
  wrap(($) => $('time[itemprop*="pubdate"]').attr('datetime')),
  wrap(($) => $('[property*="dc:date"]').attr('content')),
  wrap(($) => $('[property*="dc:created"]').attr('content')),
  wrap(($) => $('time[datetime][pubdate]').attr('datetime')),
  wrap(($) => $('meta[name="sailthru.date"]').attr('content')),
  wrap(($) => $('meta[property="book:release_date"]').attr('content')),
  wrap(($) => $('time[datetime]').attr('datetime')),
  wrap(($) => $('[class*="byline"]').text()),
  wrap(($) => $('[class*="dateline"]').text()),
  wrap(($) => $('[class*="date"]').text()),
  wrap(($) => $('[id*="date"]').text()),
  wrap(($) => $('[class*="post-meta"]').text()),
  wrap(($, url) => {
    let regexp = /(\d{4}[\-\/]\d{2}[\-\/]\d{2})/
    let match = regexp.exec(url)
    if (!match) return
    let string = match[1]
    let date = new Date(string)
    return date.toISOString()
  }),
  wrap(($) => {
    let text = $('[class*="byline"]').text()
    if (!text) return
    let regexp = /(\w+ \d{2},? \d{4})/
    let match = regexp.exec(text)
    if (!match) return
    let string = match[1]
    let date = new Date(string)
    return date.toISOString()
  }),
]
