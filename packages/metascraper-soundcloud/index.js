'use strict'

const {
  $filter,
  author,
  description,
  createWrap
} = require('@metascraper/helpers')
const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')

const isValidUrl = memoizeOne(url => getDomain(url) === 'soundcloud.com')

const wrapDescription = createWrap(description)
const wrapAuthor = createWrap(author)

module.exports = () => {
  const rules = {
    author: [wrapAuthor($ => $filter($, $('.soundTitle__username')))],
    description: [
      wrapDescription($ => $filter($, $('.soundTitle__description')))
    ]
  }

  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
