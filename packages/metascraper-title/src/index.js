'use strict'

const {
  $jsonld,
  $filter,
  $meta,
  title,
  toRule
} = require('@metascraper/helpers')

const toTitle = toRule(title)

module.exports = () => {
  const rules = {
    title: [
      toTitle($meta('og:title')),
      toTitle($meta('twitter:title')),
      toTitle($ => $filter($, $('title'))),
      toTitle($jsonld('headline')),
      toTitle($ => $filter($, $('.post-title'))),
      toTitle($ => $filter($, $('.entry-title'))),
      toTitle($ => $filter($, $('h1[class*="title" i] a'))),
      toTitle($ => $filter($, $('h1[class*="title" i]')))
    ]
  }

  rules.pkgName = 'metascraper-title'

  return rules
}
