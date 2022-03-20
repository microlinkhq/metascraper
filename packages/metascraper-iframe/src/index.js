'use strict'

const { memoizeOne } = require('@metascraper/helpers')

const fromProvider = require('./from-provider')
const fromHTML = require('./from-html')
const fromTwitter = require('./from-twitter')

const isValidUrl = memoizeOne(
  (url, $) =>
    fromHTML.test(url, $) ||
    fromProvider.test(url, $) ||
    fromTwitter.test(url, $),
  memoizeOne.EqualityUrlAndHtmlDom
)

module.exports = ({ gotOpts } = {}) => {
  const rules = {
    iframe: [fromHTML(gotOpts), fromProvider(gotOpts), fromTwitter(gotOpts)]
  }

  rules.test = ({ url, htmlDom }) => isValidUrl(url, htmlDom)

  return rules
}

module.exports.test = test
