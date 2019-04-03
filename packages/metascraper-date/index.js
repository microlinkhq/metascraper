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
 * Wrap a rule with validation and formatting logic when multiple elements may be matched by the
 * selector.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrapMultiple = rule => ({ htmlDom }) => {
  const elems = rule(htmlDom)
  return elems.toArray().reduce((memo, elem) => (
    memo || date(htmlDom(elem).text())
  ), false)
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
    wrapMultiple($ => $('[class*="byline" i]')),
    wrapMultiple($ => $('[class*="dateline" i]')),
    wrapMultiple($ => $('[id*="metadata" i]')),
    wrapMultiple($ => $('[class*="metadata" i]')), // twitter, move into a bundle of rules
    wrapMultiple($ => $('[id*="date" i]')),
    wrapMultiple($ => $('[class*="date" i]')),
    wrapMultiple($ => $('[id*="publish" i]')),
    wrapMultiple($ => $('[class*="publish" i]')),
    wrapMultiple($ => $('[id*="post-timestamp" i]')),
    wrapMultiple($ => $('[class*="post-timestamp" i]')),
    wrapMultiple($ => $('[id*="post-meta" i]')),
    wrapMultiple($ => $('[class*="post-meta" i]')),
    wrapMultiple($ => $('[id*="time" i]')),
    wrapMultiple($ => $('[class*="time" i]'))
  ]
})
