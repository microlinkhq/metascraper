'use strict'

/**
 * Prefer the Pinterest user avatar when og:image is the generic share card.
 */

const {
  $jsonld,
  $meta,
  image,
  memoizeOne,
  parseUrl,
  toRule
} = require('@metascraper/helpers')

const toImage = toRule(image)

const test = memoizeOne(
  url => parseUrl(url).domainWithoutSuffix === 'pinterest'
)

const DEFAULT_OG = 'default_open_graph'

module.exports = () => {
  const rules = {
    image: [
      toImage($ => {
        const og = $meta('og:image')($)
        if (!og?.includes(DEFAULT_OG)) return
        return $jsonld('mainEntity.image.contentUrl')($)
      })
    ]
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-pinterest'

  return rules
}

module.exports.test = test
