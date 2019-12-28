'use strict'

const { $jsonld, toRule, description } = require('@metascraper/helpers')

module.exports = opts => {
  const toDescription = toRule(description, opts)

  return {
    description: [
      toDescription($jsonld('description')),
      toDescription($ => $('meta[property="og:description"]').attr('content')),
      toDescription($ => $('meta[name="twitter:description"]').attr('content')),
      toDescription($ => $('meta[name="description"]').attr('content')),
      toDescription($ => $('meta[itemprop="description"]').attr('content')),
      toDescription($jsonld('articleBody'))
    ]
  }
}
