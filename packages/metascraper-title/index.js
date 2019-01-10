'use strict'

const { $filter, title } = require('@metascraper/helpers')

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return title(value)
}

module.exports = () => ({
  title: [
    wrap($ => $('meta[property="og:title"]').attr('content')),
    wrap($ => $('meta[name="twitter:title"]').attr('content')),
    wrap($ => $('.post-title').text()),
    wrap($ => $('.entry-title').text()),
    wrap($ => $('h1[class*="title" i] a').text()),
    wrap($ => $('h1[class*="title" i]').text()),
    wrap($ => $filter($, $('title')))
  ]
})
