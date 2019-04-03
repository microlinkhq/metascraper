'use strict'

const { date, $filter } = require('@metascraper/helpers')

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
 * extract the date for a given element
 *
 * @param {CheerioElement} element
 * @return {String | Boolean} false if no date, otherwise a string representing the date
 */
const textDate = el => date(el.text())

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
    wrap($ => $filter($, $('[class*="byline" i]'), textDate)),
    wrap($ => $filter($, $('[class*="dateline" i]'), textDate)),
    wrap($ => $filter($, $('[id*="metadata" i]'), textDate)),
    wrap($ => $filter($, $('[class*="metadata" i]'), textDate)), // twitter, move into a bundle of rules
    wrap($ => $filter($, $('[id*="date" i]'), textDate)),
    wrap($ => $filter($, $('[class*="date" i]'), textDate)),
    wrap($ => $filter($, $('[id*="publish" i]'), textDate)),
    wrap($ => $filter($, $('[class*="publish" i]'), textDate)),
    wrap($ => $filter($, $('[id*="post-timestamp" i]'), textDate)),
    wrap($ => $filter($, $('[class*="post-timestamp" i]'), textDate)),
    wrap($ => $filter($, $('[id*="post-meta" i]'), textDate)),
    wrap($ => $filter($, $('[class*="post-meta" i]'), textDate)),
    wrap($ => $filter($, $('[id*="time" i]'), textDate)),
    wrap($ => $filter($, $('[class*="time" i]'), textDate))
  ]
})
