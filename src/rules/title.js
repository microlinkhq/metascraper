'use strict'

const isString = require('lodash.isstring')

function wrap (rule) {
  return ($) => {
    const value = rule($)

    if (!isString(value)) return

    return value
      .replace(/\s+/g, ' ') // remove extra whitespace
      .trim()
  }
}

module.exports = [
  wrap(($) => $('meta[property="og:title"]').attr('content')),
  wrap(($) => $('meta[name="twitter:title"]').attr('content')),
  wrap(($) => $('meta[name="sailthru.title"]').attr('content')),
  wrap(($) => $('.post-title').text()),
  wrap(($) => $('.entry-title').text()),
  wrap(($) => $('[itemtype="http://schema.org/BlogPosting"] [itemprop="name"]').text()),
  wrap(($) => $('h1[class*="title"] a').text()),
  wrap(($) => $('h1[class*="title"]').text()),
  wrap(($) => $('title').text())
]
