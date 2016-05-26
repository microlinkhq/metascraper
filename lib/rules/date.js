
const isIso = require('is-isodate')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return ($) => {
    let value = rule($)
    let date

    if (isIso(value)) {
      date = new Date(value)
    } else if (typeof value == 'number') {
      date = new Date(value)
    } else if (typeof value == 'string') {
      date = new Date(value)
      if (isNaN(date.getTime())) date = null
    }

    if (date == null) return
    return date.toISOString()
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
  wrap(($) => $('[class*="date"]').text()),
  wrap(($, url) => {
    const regexp = /(\d{4}[\-\/]\d{2}[\-\/]\d{2})/
    const match = regexp.exec(url)
    if (!match) return
    const [ full, string ] = match
    const date = new Date(string)
    return date.toISOString()
  }),
  wrap(($) => {
    const text = $('[class*="byline"]').text()
    if (!text) return
    const regexp = /(\w+ \d{2},? \d{4})/
    const match = regexp.exec(text)
    if (!match) return
    const [ full, string ] = match
    const date = new Date(string)
    return date.toISOString()
  }),
]
