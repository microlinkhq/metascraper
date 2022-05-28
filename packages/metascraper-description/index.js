'use strict'

const { $jsonld, toRule, description } = require('@metascraper/helpers')

module.exports = opts => {
  const toDescription = toRule(description, opts)

  return {
    description: [
      toDescription($ => $('meta[property="og:description"]').prop('content')),
      toDescription($ => $('meta[name="twitter:description"]').prop('content')),
      toDescription($ =>
        $('meta[property="twitter:description"]').prop('content')
      ),
      toDescription($ => $('meta[name="description"]').prop('content')),
      toDescription($ => $('meta[itemprop="description"]').prop('content')),
      toDescription($jsonld('articleBody')),
      toDescription($jsonld('description'))
    ]
  }
}
