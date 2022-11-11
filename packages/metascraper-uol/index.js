'use strict'

const {
  $filter,
  $jsonld,
  description,
  memoizeOne,
  parseUrl,
  title,
  toRule
} = require('@metascraper/helpers')

const ROOT_DOMAINS = ['uol.com.br', 'torcedores.com']

const test = memoizeOne(url =>
  ROOT_DOMAINS.some(domain => parseUrl(url).domain === domain)
)

const toTitle = toRule(title)
const toDescription = toRule(description)

module.exports = () => {
  const rules = {
    title: [
      toTitle(($, url) => $jsonld('headline')($, url)),
      toTitle(($, url) => $jsonld('name')($, url)),
      toTitle($ => $filter($, $('title')))
    ],
    description: [toDescription(($, url) => $jsonld('description')($, url))]
  }

  rules.test = ({ url }) => test(url)

  return rules
}

module.exports.test = test
