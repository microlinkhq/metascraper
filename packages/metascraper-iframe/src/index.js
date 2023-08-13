'use strict'

const { memoizeOne } = require('@metascraper/helpers')

const fromProvider = require('./from-provider')
const fromHTML = require('./from-html')

const test = memoizeOne(
  (url, $) => fromHTML.test(url, $) || fromProvider.test(url, $),
  memoizeOne.EqualityUrlAndHtmlDom
)

module.exports = ({ gotOpts } = {}) => {
  const rules = {
    iframe: [fromHTML({ gotOpts }), fromProvider({ gotOpts })]
  }

  rules.test = ({ url, htmlDom }) => test(url, htmlDom)

  return rules
}

module.exports.test = test
