'use strict'

const { toRule, url } = require('@metascraper/helpers')

const toUrl = toRule(url)

module.exports = () => {
  const rules = {
    feed: [
      toUrl($ => $('link[type="application/rss+xml"]').attr('href')),
      toUrl($ => $('link[type="application/feed+json"]').attr('href')),
      toUrl($ => $('link[type="application/atom+xml"]').attr('href'))
    ]
  }

  rules.pkgName = 'metascraper-feed'

  return rules
}
