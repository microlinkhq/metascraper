'use strict'

const { date } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return date(value)
}

/**
 * Rules.
 */

module.exports = () => ({
  date: [
    wrap($ => $('meta[property*="updated_time" i]').attr('content')),
    wrap($ => $('meta[property*="modified_time" i]').attr('content')),
    wrap($ => $('meta[property*="published_time" i]').attr('content')),
    wrap($ => $('meta[property*="release_date" i]').attr('content')),
    wrap($ => $('meta[name="date" i]').attr('content')),
    wrap($ => $('[itemprop*="datemodified" i]').attr('content')),
    wrap($ => $('[itemprop="datepublished" i]').attr('content')),
    wrap($ => $('[itemprop*="date" i]').attr('content')),
    wrap($ => $('time[itemprop*="date" i]').attr('datetime')),
    wrap($ => $('time[datetime]').attr('datetime')),
    wrap($ => $('time[datetime][pubdate]').attr('datetime')),
    wrap($ => $('meta[name*="dc.date" i]').attr('content')),
    wrap($ => $('meta[name*="dc.date.issued" i]').attr('content')),
    wrap($ => $('meta[name*="dc.date.created" i]').attr('content')),
    wrap($ => $('meta[name*="dcterms.date" i]').attr('content')),
    wrap($ => $('[property*="dc:date" i]').attr('content')),
    wrap($ => $('[property*="dc:created" i]').attr('content')),
    wrap($ => $('[class*="byline" i]').text()),
    wrap($ => $('[class*="dateline" i]').text()),
    wrap($ => $('[id*="metadata" i]').text()),
    wrap($ => $('[class*="metadata" i]').text()), // twitter, move into a bundle of rules
    wrap($ => $('[id*="date" i]').text()),
    wrap($ => $('[class*="date" i]').text()),
    wrap($ => $('[id*="publish" i]').text()),
    wrap($ => $('[class*="publish" i]').text()),
    wrap($ => $('[id*="post-timestamp" i]').text()),
    wrap($ => $('[class*="post-timestamp" i]').text()),
    wrap($ => $('[id*="post-meta" i]').text()),
    wrap($ => $('[class*="post-meta" i]').text()),
    wrap($ => $('[id*="time" i]').text()),
    wrap($ => $('[class*="time" i]').text())
  ]
})
