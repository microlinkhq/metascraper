'use strict'

const { $jsonld, url: urlFn, toRule } = require('@metascraper/helpers')

const toUrl = toRule(urlFn)

module.exports = () => ({
  logo: [
    toUrl($jsonld('publisher.logo.url')),
    toUrl($jsonld('publisher.logo')),
    toUrl($ => $('meta[property="og:logo"]').attr('content')),
    toUrl($ => $('meta[itemprop="logo"]').attr('content')),
    toUrl($ => $('img[itemprop="logo"]').attr('src'))
  ]
})
