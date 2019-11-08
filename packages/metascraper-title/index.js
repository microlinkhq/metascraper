'use strict'

const { $jsonld, $filter, title, toRule } = require('@metascraper/helpers')

const toTitle = toRule(title)

module.exports = () => ({
  title: [
    toTitle($ => $('meta[property="og:title"]').attr('content')),
    toTitle($ => $('meta[name="twitter:title"]').attr('content')),
    toTitle($ => $filter($, $('title'))),
    toTitle($jsonld('headline')),
    toTitle($ => $('.post-title').text()),
    toTitle($ => $filter($, $('.entry-title'))),
    toTitle($ => $('h1[class*="title" i] a').text()),
    toTitle($ => $('h1[class*="title" i]').text())
  ]
})
