'use strict'

const {
  $jsonld,
  $filter,
  $meta,
  image,
  toRule
} = require('@metascraper/helpers')

const toImage = toRule(image)

const getSrc = el => el.attr('src')

module.exports = () => {
  const rules = {
    image: [
      toImage($meta('og:image:secure_url')),
      toImage($meta('og:image:url')),
      toImage($meta('og:image')),
      toImage($meta('twitter:image:src')),
      toImage($meta('twitter:image')),
      toImage($ => $('meta[itemprop="image"]').attr('content')),
      toImage($jsonld('image.0.url')),
      toImage($jsonld('image.url')),
      toImage($jsonld('image')),
      toImage($ => $filter($, $('article img[src]'), getSrc)),
      toImage($ => $filter($, $('#content img[src]'), getSrc)),
      toImage($ => $('img[alt*="author" i]').attr('src')),
      toImage($ => $('img[src]:not([aria-hidden="true"])').attr('src'))
    ]
  }

  rules.pkgName = 'metascraper-image'

  return rules
}
