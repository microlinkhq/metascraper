'use strict'

const { $jsonld, $meta, toRule, description } = require('@metascraper/helpers')

module.exports = opts => {
  const toDescription = toRule(description, opts)

  const rules = {
    description: [
      toDescription($meta('og:description')),
      toDescription($meta('twitter:description')),
      toDescription($meta('description')),
      toDescription($ => $('meta[itemprop="description"]').attr('content')),
      toDescription($jsonld('articleBody')),
      toDescription($jsonld('description'))
    ]
  }

  rules.pkgName = 'metascraper-description'

  return rules
}
