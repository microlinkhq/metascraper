'use strict'

const { $filter, author, description, toRule } = require('@metascraper/helpers')

const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')

const isValidUrl = memoizeOne(url => getDomain(url) === 'soundcloud.com')

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
