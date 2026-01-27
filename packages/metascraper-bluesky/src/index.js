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

const getHandle = url => new URL(url).pathname.split('/')[2]

module.exports = () => {
  const rules = {
    image: [
      toImage(
        ($, url) =>
          $(
            `[data-testid="postThreadItem-by-${getHandle(
              url
            )}"] img[src*="feed_thumbnail"]`
          ).attr('src') || $('meta[property="og:image"]').attr('content')
      )
    ],
    author: [toAuthor($jsonld('mainEntity.name'))],
    publisher: () => 'Bluesky'
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-bluesky'

  return rules
}

module.exports.test = test
