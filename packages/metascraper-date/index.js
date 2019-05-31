'use strict'

const { date, $filter, $jsonld } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return date(value)
}

/**
 * Rules.
 */

module.exports = () => ({
  date: [
    wrap($jsonld('dateModified')),
    wrap($jsonld('datePublished')),
    wrap($jsonld('dateCreated')),
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
    wrap($ => $filter($, $('[class*="byline" i]'))),
    wrap($ => $filter($, $('[class*="dateline" i]'))),
    wrap($ => $filter($, $('[id*="metadata" i]'))),
    wrap($ => $filter($, $('[class*="metadata" i]'))), // twitter, move into a bundle of rules
    wrap($ => $filter($, $('[id*="date" i]'))),
    wrap($ => $filter($, $('[class*="date" i]'))),
    wrap($ => $filter($, $('[id*="publish" i]'))),
    wrap($ => $filter($, $('[class*="publish" i]'))),
    wrap($ => $filter($, $('[id*="post-timestamp" i]'))),
    wrap($ => $filter($, $('[class*="post-timestamp" i]'))),
    wrap($ => $filter($, $('[id*="post-meta" i]'))),
    wrap($ => $filter($, $('[class*="post-meta" i]'))),
    wrap($ => $filter($, $('[id*="time" i]'))),
    wrap($ => $filter($, $('[class*="time" i]')))
  ]
})
