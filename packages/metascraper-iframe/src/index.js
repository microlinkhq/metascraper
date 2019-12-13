'use strict'

const { memoizeOne } = require('@metascraper/helpers')

const fromProvider = require('./from-provider')
const fromHTML = require('./from-html')

const htmlTest = fromHTML.test.bind(fromHTML)
const providerTest = fromProvider.test.bind(fromProvider)

const test = memoizeOne(
  ({ url, htmlDom: $ }) => htmlTest($) || providerTest(url)
)

module.exports = () => {
  const rules = { iframe: [fromHTML, fromProvider] }
  rules.test = test
  return rules
}

module.exports.test = test
