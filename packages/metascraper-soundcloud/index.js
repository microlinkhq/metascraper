'use strict'

const {
  $filter,
  author,
  description,
  memoizeOne,
  parseUrl,
  toRule
} = require('@metascraper/helpers')

const toDescription = toRule(description)
const toAuthor = toRule(author)

const test = memoizeOne(
  url => parseUrl(url).domainWithoutSuffix === 'soundcloud'
)

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $filter($, $('.soundTitle__username')))],
    description: [toDescription($ => $filter($, $('.soundTitle__description')))]
  }

  rules.test = ({ url }) => test(url)

  return rules
}
