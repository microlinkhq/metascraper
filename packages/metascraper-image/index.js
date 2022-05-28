'use strict'

const { $jsonld, $filter, image, toRule } = require('@metascraper/helpers')

const toImage = toRule(image)

const getSrc = el => el.attr('src')

module.exports = () => ({
  image: [
    toImage($ => $('meta[property="og:image:secure_url"]').prop('content')),
    toImage($ => $('meta[property="og:image:url"]').prop('content')),
    toImage($ => $('meta[property="og:image"]').prop('content')),
    toImage($ => $('meta[name="twitter:image:src"]').prop('content')),
    toImage($ => $('meta[property="twitter:image:src"]').prop('content')),
    toImage($ => $('meta[name="twitter:image"]').prop('content')),
    toImage($ => $('meta[property="twitter:image"]').prop('content')),
    toImage($ => $('meta[itemprop="image"]').prop('content')),
    toImage($jsonld('image.0.url')),
    toImage($jsonld('image.url')),
    toImage($jsonld('image.url')),
    toImage($jsonld('image')),
    toImage($ => $filter($, $('article img[src]'), getSrc)),
    toImage($ => $filter($, $('#content img[src]'), getSrc)),
    toImage($ => $('img[alt*="author" i]').prop('src')),
    toImage($ => $('img[src]:not([aria-hidden="true"])').prop('src'))
  ]
})
