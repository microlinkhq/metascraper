'use strict'

const { $jsonld, $filter, title, toRule } = require('@metascraper/helpers')

const toTitle = toRule(title)

module.exports = () => ({
  title: [
    toTitle($ => $('meta[property="og:title"]').prop('content')),
    toTitle($ => $('meta[name="twitter:title"]').prop('content')),
    toTitle($ => $('meta[property="twitter:title"]').prop('content')),
    toTitle($ => $filter($, $('title'))),
    toTitle($jsonld('headline')),
    toTitle($ => $filter($, $('.post-title'))),
    toTitle($ => $filter($, $('.entry-title'))),
    toTitle($ => $filter($, $('h1[class*="title" i] a'))),
    toTitle($ => $filter($, $('h1[class*="title" i]')))
  ]
})
