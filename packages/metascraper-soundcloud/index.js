'use strict'

const { $filter, author, description, toRule } = require('@metascraper/helpers')
const { getDomainWithoutSuffix } = require('tldts')
const memoizeOne = require('memoize-one')

const isValidUrl = memoizeOne(
  url => getDomainWithoutSuffix(url) === 'soundcloud'
)

const toDescription = toRule(description)
const toAuthor = toRule(author)

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $filter($, $('.soundTitle__username')))],
    description: [toDescription($ => $filter($, $('.soundTitle__description')))]
  }

  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
