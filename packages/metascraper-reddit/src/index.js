'use strict'

const {
  $filter,
  $meta,
  description,
  image,
  memoizeOne,
  parseUrl,
  title,
  toRule
} = require('@metascraper/helpers')

const toDescription = toRule(description)
const toTitle = toRule(title)
const toImage = toRule(image)

const REDDIT_DOMAINS = ['reddit.com', 'redd.it']

const test = memoizeOne(url => REDDIT_DOMAINS.includes(parseUrl(url).domain))

const previewUrl = url =>
  typeof url === 'string'
    ? `https://s.microlink.io/?c=1&o1=ro&url=${encodeURIComponent(url)}`
    : undefined

module.exports = () => {
  const rules = {
    description: [toDescription($meta('description'))],
    title: [toTitle($ => $filter($, $('title')))],
    image: [
      toImage($ => {
        const imageUrl = $meta('og:image')($)
        return imageUrl ? previewUrl(imageUrl) : undefined
      })
    ],
    publisher: () => 'Reddit'
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-reddit'

  return rules
}

module.exports.test = test
module.exports.previewUrl = previewUrl
