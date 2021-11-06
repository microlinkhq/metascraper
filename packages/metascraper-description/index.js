'use strict'

const { $jsonld, toRule, description } = require('@metascraper/helpers')

const trimString = str => {
    const maxLength = 290
    if (str.length > maxLength) {
      str = str.substring(0, maxLength)
      const lastSpace = str.lastIndexOf(' ')
      if (lastSpace > 0) str = str.substring(0, lastSpace)
      const lastComma = str.lastIndexOf(',')
      if (lastComma > 0) str = str.substring(0, lastComma)
      str = str.substring(0, str.lastIndexOf(','))
      return str + '...'
    }
    return str
}

module.exports = opts => {
  const toDescription = toRule(description, opts)

  return {
    description: [
      toDescription($ => $('meta[property="og:description"]').attr('content')),
      toDescription($ => $('meta[name="twitter:description"]').attr('content')),
      toDescription($ =>
        $('meta[property="twitter:description"]').attr('content')
      ),
      toDescription($ => $('meta[name="description"]').attr('content')),
      toDescription($ => $('meta[itemprop="description"]').attr('content')),
      toDescription($jsonld('articleBody')),
      toDescription($jsonld('description')),
      toDescription($ => trimString($('p').innerText))
    ]
  }
}
