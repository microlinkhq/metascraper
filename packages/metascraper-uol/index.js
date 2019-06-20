'use strict'

const {
  $jsonld,
  title,
  description,
  createWrap,
  createWard
} = require('@metascraper/helpers')
const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')

const ROOT_DOMAINS = ['uol.com.br', 'torcedores.com']

const isValidUrl = memoizeOne(url =>
  ROOT_DOMAINS.some(domain => getDomain(url) === domain)
)

const ward = createWard(({ url }) => isValidUrl(url))

const wrapTitle = createWrap(title)
const wrapDescription = createWrap(description)

module.exports = () => ({
  title: [
    ward(wrapTitle(($, url) => $jsonld('headline')($, url))),
    ward(wrapTitle($ => $('title').text()))
  ],
  description: [
    ward(wrapDescription(($, url) => $jsonld('description')($, url)))
  ]
})

module.exports.isValidUrl = isValidUrl
