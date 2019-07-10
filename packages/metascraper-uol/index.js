'use strict'

const {
  $jsonld,
  title,
  description,
  createWrap
} = require('@metascraper/helpers')
const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')

const ROOT_DOMAINS = ['uol.com.br', 'torcedores.com']

const isValidUrl = memoizeOne(url =>
  ROOT_DOMAINS.some(domain => getDomain(url) === domain)
)

const wrapTitle = createWrap(title)
const wrapDescription = createWrap(description)

module.exports = () => {
  const rules = {
    title: [
      wrapTitle(($, url) => $jsonld('headline')($, url)),
      wrapTitle(($, url) => $jsonld('name')($, url)),
      wrapTitle($ => $('title').text())
    ],
    description: [wrapDescription(($, url) => $jsonld('description')($, url))]
  }

  rules.test = ({ url }) => isValidUrl(url)
  return rules
}

module.exports.isValidUrl = isValidUrl
