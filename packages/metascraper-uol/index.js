'use strict'

const {
  $jsonld,
  title,
  description,
  createWrapper
} = require('@metascraper/helpers')
const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')

const ROOT_DOMAINS = ['uol.com.br', 'torcedores.com']

const isValidUrl = memoizeOne(url =>
  ROOT_DOMAINS.some(domain => getDomain(url) === domain)
)

const ward = fn => args => (isValidUrl(args.url) ? fn(args) : null)

const wrapTitle = createWrapper(title)
const wrapDescription = createWrapper(description)

module.exports = () => {
  return {
    title: [
      ward(wrapTitle(($, url) => $jsonld('headline')($, url))),
      ward(wrapTitle($ => $('title').text()))
    ],
    description: [
      ward(wrapDescription(($, url) => $jsonld('description')($, url)))
    ]
  }
}

module.exports.isValidUrl = isValidUrl
