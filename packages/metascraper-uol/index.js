'use strict'

const {
  $jsonld,
  title,
  description,
  toRule,
  memoizeOne
} = require('@metascraper/helpers')
const { getDomain } = require('tldts')

const ROOT_DOMAINS = ['uol.com.br', 'torcedores.com']

const isValidUrl = memoizeOne(({ url }) =>
  ROOT_DOMAINS.some(domain => getDomain(url) === domain)
)

const toTitle = toRule(title)
const toDescription = toRule(description)

module.exports = () => {
  const rules = {
    title: [
      toTitle(($, url) => $jsonld('headline')($, url)),
      toTitle(($, url) => $jsonld('name')($, url)),
      toTitle($ => $('title').text())
    ],
    description: [toDescription(($, url) => $jsonld('description')($, url))]
  }

  rules.test = isValidUrl

  return rules
}

module.exports.isValidUrl = isValidUrl
