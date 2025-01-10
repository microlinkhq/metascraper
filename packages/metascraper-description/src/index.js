'use strict'

const { $jsonld, toRule, description } = require('@metascraper/helpers')

module.exports = opts => {
  const toDescription = toRule(description, opts)

  const rules = {
    description: [
      toDescription($ => $('meta[property="og:description"]').attr('content')),
      toDescription($ => $('meta[name="twitter:description"]').attr('content')),
      toDescription($ =>
        $('meta[property="twitter:description"]').attr('content')
      ),
      toDescription($ => $('meta[name="description"]').attr('content')),
      toDescription($ => $('meta[itemprop="description"]').attr('content')),
      toDescription($jsonld('articleBody')),
      toDescription($jsonld('description'))
    ]
  }

  rules.pkgName = 'metascraper-description'

  return rules
}
