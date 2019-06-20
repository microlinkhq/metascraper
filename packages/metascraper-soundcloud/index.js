'use strict'

const {
  $filter,
  author,
  description,
  createWrap,
  createWard
} = require('@metascraper/helpers')
const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')

const isValidUrl = memoizeOne(url => getDomain(url) === 'soundcloud.com')

const ward = createWard(({ url }) => isValidUrl(url))
const wrapDescription = createWrap(description)
const wrapAuthor = createWrap(author)

module.exports = () => ({
  author: [ward(wrapAuthor($ => $filter($, $('.soundTitle__username'))))],
  description: [
    ward(wrapDescription($ => $filter($, $('.soundTitle__description'))))
  ]
})
