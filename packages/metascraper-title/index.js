'use strict'

const { $jsonld, $filter, title } = require('@metascraper/helpers')

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return title(value)
}

module.exports = () => ({
  title: [
    wrap($jsonld('headline')),
    wrap($ => $('meta[property="og:title"]').attr('content')),
    wrap($ => $('meta[name="twitter:title"]').attr('content')),
    wrap($ => $('.post-title').text()),
    wrap($ => ($('.entry-title').length === 1 ? $('.entry-title').text() : '')),
    wrap($ => $('h1[class*="title" i] a').text()),
    wrap($ => $('h1[class*="title" i]').text()),
    wrap($ => $filter($, $('title')))
  ]
})
