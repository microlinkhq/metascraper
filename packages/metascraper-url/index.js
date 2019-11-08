'use strict'

const { toRule, url: urlFn } = require('@metascraper/helpers')

const toUrl = toRule(urlFn)

module.exports = () => ({
  url: [
    toUrl($ => $('meta[property="og:url"]').attr('content')),
    toUrl($ => $('meta[name="twitter:url"]').attr('content')),
    toUrl($ => $('link[rel="canonical"]').attr('href')),
    toUrl($ => $('link[rel="alternate"][hreflang="x-default"]').attr('href')),
    ({ url }) => url
  ]
})
