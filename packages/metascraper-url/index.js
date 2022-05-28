'use strict'

const { toRule, url: urlFn } = require('@metascraper/helpers')

const toUrl = toRule(urlFn)

module.exports = () => ({
  url: [
    toUrl($ => $('meta[property="og:url"]').prop('content')),
    toUrl($ => $('meta[name="twitter:url"]').prop('content')),
    toUrl($ => $('meta[property="twitter:url"]').prop('content')),
    toUrl($ => $('link[rel="canonical"]').prop('href')),
    toUrl($ => $('link[rel="alternate"][hreflang="x-default"]').prop('href')),
    ({ url }) => url
  ]
})
