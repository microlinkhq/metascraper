'use strict'

const { $jsonld, wrapRule, description } = require('@metascraper/helpers')

const toDescription = wrapRule(description)

module.exports = () => {
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
