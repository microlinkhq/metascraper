'use strict'

const { memoizeOne } = require('@metascraper/helpers')

const fromProvider = require('./from-provider')
const fromHTML = require('./from-html')

const htmlTest = fromHTML.test.bind(fromHTML)
const providerTest = fromProvider.test.bind(fromProvider)

const isValidUrl = memoizeOne(
  ($, url) => htmlTest($) || providerTest(url),
  memoizeOne.EqualityUrlAndHtmlDom
)

const test = ({ url, htmlDom }) => isValidUrl(htmlDom, url)

module.exports = ({ gotOpts } = {}) => {
  const rules = { iframe: [fromHTML(gotOpts), fromProvider(gotOpts)] }
  rules.test = test
  return rules
}

module.exports.test = test
