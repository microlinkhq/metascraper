'use strict'

const {
  $jsonld,
  $meta,
  author,
  description,
  memoizeOne,
  parseUrl,
  title,
  toRule
} = require('@metascraper/helpers')

const toAuthor = toRule(author)
const toDescription = toRule(description)
const toTitle = toRule(title)

const test = memoizeOne(url => parseUrl(url).domain === 'imdb.com')

module.exports = () => {
  const rules = {
    author: [
      toAuthor($jsonld('director.name')),
      toAuthor($jsonld('creator.name'))
    ],
    description: [
      toDescription($meta('description')),
      toDescription($jsonld('description'))
    ],
    publisher: () => 'IMDb',
    title: [toTitle($jsonld('name'))]
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-imdb'

  return rules
}

module.exports.test = test
