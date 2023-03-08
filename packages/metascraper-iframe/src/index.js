'use strict'

const { memoizeOne } = require('@metascraper/helpers')

const fromProvider = require('./from-provider')
const fromTwitter = require('./from-twitter')
const fromHTML = require('./from-html')

const test = memoizeOne(
  (url, $) =>
    fromHTML.test(url, $) ||
    fromProvider.test(url, $) ||
    fromTwitter.test(url, $),
  memoizeOne.EqualityUrlAndHtmlDom
)

module.exports = ({ gotOpts } = {}) => {
  const rules = {
    iframe: [
      fromHTML({ gotOpts }),
      fromProvider({ gotOpts }),
      fromTwitter({ gotOpts })
    ]
  }

  rules.test = ({ url, htmlDom }) => test(url, htmlDom)

  return rules
}

module.exports.test = test
