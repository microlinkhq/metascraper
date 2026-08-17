'use strict'

const { $meta, toRule, url: urlFn } = require('@metascraper/helpers')

const toUrl = toRule(urlFn)

module.exports = () => {
  const rules = {
    url: [
      toUrl($meta('og:url')),
      toUrl($meta('twitter:url')),
      toUrl($ => $('link[rel="canonical"]').attr('href')),
      toUrl($ => $('link[rel="alternate"][hreflang="x-default"]').attr('href')),
      ({ url }) => url
    ]
  }

  rules.pkgName = 'metascraper-url'

  return rules
}
