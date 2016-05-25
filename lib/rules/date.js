
import isIso from 'is-isodate'
import { meta, text, time } from '../create-rule'

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return async (window) => {
    const value = await rule(window)
    let date

    if (isIso(value)) {
      date = new Date(value)
    } else if (typeof value == 'number') {
      date = new Date(value)
    } else if (typeof value == 'string') {
      date = new Date(value)
      if (isNaN(date.getTime())) date = null
    }

    if (date == null) return null
    return date.toISOString()
  }
}

/**
 * Rules.
 */

export default [
  wrap(meta('meta[property="article:published_time"]')),
  wrap(meta('meta[name="dc.date"]')),
  wrap(meta('meta[name="DC.date"]')),
  wrap(meta('meta[name="dc.date.issued"]')),
  wrap(meta('meta[name="DC.date.issued"]')),
  wrap(meta('meta[name="dc.date.created"]')),
  wrap(meta('meta[name="DC.date.created"]')),
  wrap(meta('meta[name="DC.Date"]')),
  wrap(meta('meta[name="date"]')),
  wrap(meta('meta[name="dcterms.date"]')),
  wrap(meta('[itemprop="datePublished"]')),
  wrap(time('time[itemprop*="pubDate"]')),
  wrap(time('time[itemprop*="pubdate"]')),
  wrap(meta('[property*="dc:date"]')),
  wrap(meta('[property*="dc:created"]')),
  wrap(time('time[datetime][pubdate]')),
  wrap(meta('meta[name="sailthru.date"]')),
  wrap(meta('meta[property="book:release_date"]')),
  wrap(time('time[datetime]')),
  wrap(text('[class*="date"]')),
  wrap(async (window) => {
    const url = window.location.href
    const regexp = /(\d{4}[\-\/]\d{2}[\-\/]\d{2})/
    const match = regexp.exec(url)
    if (!match) return
    const [ full, string ] = match
    const date = new Date(string)
    return date.toISOString()
  }),
  wrap(async (window) => {
    const el = window.document.querySelector('[class*="byline"]')
    if (!el) return
    debugger
    const text = el.textContent
    const regexp = /(\w+ \d{2},? \d{4})/
    const match = regexp.exec(text)
    if (!match) return
    const [ full, string ] = match
    const date = new Date(string)
    return date.toISOString()
  }),
]
