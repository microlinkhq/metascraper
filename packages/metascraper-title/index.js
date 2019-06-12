'use strict'

const { $jsonld, $filter, title } = require('@metascraper/helpers')

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return title(value)
}

module.exports = () => ({
  title: [
    wrap($ => $('meta[property="og:title"]').attr('content')),
    wrap($ => $('meta[name="twitter:title"]').attr('content')),
    wrap($ => $filter($, $('title'))),
    wrap($jsonld('headline')),
    wrap($ => $('.post-title').text()),
    wrap($ => $filter($, $('.entry-title'))),
    wrap($ => $('h1[class*="title" i] a').text()),
    wrap($ => $('h1[class*="title" i]').text())
  ]
})
