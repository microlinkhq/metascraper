'use strict'

const { getValue, titleize } = require('@metascraper/helpers')
const { isString } = require('lodash')

const validator = value => isString(value) && titleize(value)

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return validator(value)
}

module.exports = () => ({
  title: [
    wrap($ => $('meta[property="og:title"]').attr('content')),
    wrap($ => $('meta[name="twitter:title"]').attr('content')),
    wrap($ => $('.post-title').text()),
    wrap($ => $('.entry-title').text()),
    wrap($ => $('h1[class*="title"] a').text()),
    wrap($ => $('h1[class*="title"]').text()),
    wrap($ => getValue($, $('title')))
  ]
})

module.exports.validator = wrap
