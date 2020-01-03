'use strict'

const { $jsonld, $filter, image, toRule } = require('@metascraper/helpers')

const toImage = toRule(image)

const getSrc = el => el.attr('src')

module.exports = () => ({
  image: [
    toImage($ => $('meta[property="og:image:secure_url"]').attr('content')),
    toImage($ => $('meta[property="og:image:url"]').attr('content')),
    toImage($ => $('meta[property="og:image"]').attr('content')),
    toImage($ => $('meta[name="twitter:image:src"]').attr('content')),
    toImage($ => $('meta[name="twitter:image"]').attr('content')),
    toImage($ => $('meta[itemprop="image"]').attr('content')),
    toImage($jsonld('image.0.url')),
    toImage($jsonld('image.url')),
    toImage($jsonld('image.url')),
    toImage($jsonld('image')),
    toImage($ => $filter($, $('article img[src]'), getSrc)),
    toImage($ => $filter($, $('#content img[src]'), getSrc)),
    toImage($ => $('img[alt*="author" i]').attr('src')),
    toImage($ => $('img[src]:not([aria-hidden="true"])').attr('src'))
  ]
})
