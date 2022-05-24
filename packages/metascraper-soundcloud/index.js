'use strict'

const { getDomainWithoutSuffix } = require('tldts')

const {
  $filter,
  author,
  description,
  toRule,
  memoizeOne
} = require('@metascraper/helpers')

const toDescription = toRule(description)
const toAuthor = toRule(author)

const test = memoizeOne(url => getDomainWithoutSuffix(url) === 'soundcloud')

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $filter($, $('.soundTitle__username')))],
    description: [toDescription($ => $filter($, $('.soundTitle__description')))]
  }

  rules.test = ({ url }) => test(url)

  return rules
}
