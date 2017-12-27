'use strict'

const { titleize } = require('@metascraper/helpers')
const { isString } = require('lodash')

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return isString(value) && titleize(value)
}

module.exports = () => ({
  title: [
    wrap($ => $('meta[property="og:title"]').attr('content')),
    wrap($ => $('meta[name="twitter:title"]').attr('content')),
    wrap($ => $('meta[name="sailthru.title"]').attr('content')),
    wrap($ => $('.post-title').text()),
    wrap($ => $('.entry-title').text()),
    wrap($ =>
      $('[itemtype="http://schema.org/BlogPosting"] [itemprop="name"]').text()
    ),
    wrap($ => $('h1[class*="title"] a').text()),
    wrap($ => $('h1[class*="title"]').text()),
    wrap($ => $('title').text())
  ]
})
