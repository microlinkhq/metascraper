'use strict'

/**
 * Prefer the Pinterest user avatar when og:image is the generic share card.
 */

const {
  $meta,
  getHtml,
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
const USER_IMAGE =
  /"image_xlarge_url":"(https:\\u002F\\u002Fi\.pinimg\.com[^"]+|https:\/\/i\.pinimg\.com\/[^"]+)"/

const decodeJsonUrl = value => value?.replace(/\\u002F/g, '/')

module.exports = () => {
  const rules = {
    image: [
      toImage($ => {
        const og = $meta('og:image')($)
        if (!og?.includes(DEFAULT_OG)) return
        return decodeJsonUrl(getHtml($).match(USER_IMAGE)?.[1])
      })
    ]
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-pinterest'

  return rules
}

module.exports.test = test
