'use strict'

const {
  $filter,
  author,
  description,
  wrapRule
} = require('@metascraper/helpers')

const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')

const isValidUrl = memoizeOne(url => getDomain(url) === 'soundcloud.com')

const toDescription = wrapRule(description)
const toAuthor = wrapRule(author)

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $filter($, $('.soundTitle__username')))],
    description: [toDescription($ => $filter($, $('.soundTitle__description')))]
  }

  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
