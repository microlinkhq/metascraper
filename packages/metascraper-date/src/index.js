'use strict'

const { date, $filter, $jsonld, toRule } = require('@metascraper/helpers')

const toDate = toRule(date)

const dateRules = () => {
  return [
    toDate($ => $('meta[name="date" i]').attr('content')),
    toDate($ => $('[itemprop*="date" i]').attr('content')),
    toDate($ => $('time[itemprop*="date" i]').attr('datetime')),
    toDate($ => $('time[datetime]').attr('datetime')),
    toDate($ => $filter($, $('[class*="byline" i]'))),
    toDate($ => $filter($, $('[id*="date" i]'))),
    toDate($ => $filter($, $('[class*="date" i]'))),
    toDate($ => $filter($, $('[class*="time" i]')))
  ]
}

const datePublishedRules = () => {
  return [
    toDate($jsonld('datePublished')),
    toDate($jsonld('dateCreated')),
    toDate($ => $('meta[property*="published_time" i]').attr('content')),
    toDate($ => $('[itemprop="datepublished" i]').attr('content')),
    toDate($ => $filter($, $('[class*="publish" i]')))
  ]
}

const dateModifiedRules = () => {
  return [
    toDate($jsonld('dateModified')),
    toDate($ => $('meta[property*="modified_time" i]').attr('content')),
    toDate($ => $('[itemprop*="datemodified" i]').attr('content'))
  ]
}

module.exports = (
  { datePublished, dateModified } = {
    datePublished: false,
    dateModified: false
  }
) => {
  const result = {
    date: dateModifiedRules().concat(datePublishedRules(), dateRules())
  }

  if (datePublished) {
    result.datePublished = datePublishedRules()
  }

  if (dateModified) {
    result.dateModified = dateModifiedRules()
  }

  return result
}
