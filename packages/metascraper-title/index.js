'use strict'

const { $jsonld, $filter, title, wrapRule } = require('@metascraper/helpers')

const toTitle = wrapRule(title)

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
