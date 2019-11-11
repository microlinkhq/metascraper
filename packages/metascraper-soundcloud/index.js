'use strict'

const {
  $filter,
  author,
  description,
  toRule,
  memoizeOne
} = require('@metascraper/helpers')

const { getDomainWithoutSuffix } = require('tldts')

const isValidUrl = memoizeOne(
  ({ url }) => getDomainWithoutSuffix(url) === 'soundcloud'
)

const toDescription = toRule(description)
const toAuthor = toRule(author)

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $filter($, $('.soundTitle__username')))],
    description: [toDescription($ => $filter($, $('.soundTitle__description')))]
  }

  rules.test = isValidUrl
  return rules
}
