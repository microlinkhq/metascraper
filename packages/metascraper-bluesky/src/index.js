'use strict'

const {
  $jsonld,
  image,
  memoizeOne,
  author,
  parseUrl,
  toRule
} = require('@metascraper/helpers')

const toImage = toRule(image)
const toAuthor = toRule(author)

const test = memoizeOne(url => parseUrl(url).domain === 'bsky.app')

const getHandle = url => {
  const { pathname } = new URL(url)
  const parts = pathname.split('/')
  return parts[2]
}

module.exports = () => {
  const rules = {
    image: [
      toImage(($, url) => {
        const handle = getHandle(url)
        return (
          $(
            `[data-testid="postThreadItem-by-${handle}"] img[src*="feed_thumbnail"]`
          ).attr('src') || $('meta[property="og:image"]').attr('content')
        )
      })
    ],
    author: [toAuthor($jsonld('mainEntity.name'))],
    publisher: () => 'Bluesky'
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-bluesky'

  return rules
}

module.exports.test = test
