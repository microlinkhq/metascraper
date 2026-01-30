'use strict'

const {
  $jsonld,
  memoizeOne,
  author,
  date,
  description,
  parseUrl,
  toRule
} = require('@metascraper/helpers')

const toAuthor = toRule(author)
const toDate = toRule(date)
const toDescription = toRule(description)

const test = memoizeOne(url => parseUrl(url).domain === 'dribbble.com')

const parseMetaDescription = memoizeOne(description => {
  if (!description || !description.includes(' | ')) {
    return { author: null, description: null }
  }

  const parts = description.split(' | ')
  // Remove the last part if it's "Connect with them on Dribbble..."
  if (
    parts.length > 1 &&
    parts[parts.length - 1].includes('Connect with them on Dribbble')
  ) {
    parts.pop()
  }

  return {
    author: parts.length > 0 ? parts[0] : null,
    description: parts.length > 1 ? parts.slice(1).join(' | ') : null
  }
})

module.exports = () => {
  const rules = {
    author: [
      toAuthor($jsonld('creator.name')),
      toAuthor($ => {
        const description = $('meta[name="description"]').attr('content')
        const { author } = parseMetaDescription(description)
        return author
      }),
      toAuthor($ => $('h1').first().text())
    ],
    description: [
      toDescription($ => {
        const desc = $('meta[name="description"]').attr('content')
        const { description } = parseMetaDescription(desc)
        return description
      })
    ],
    date: [toDate($jsonld('uploadDate'))],
    publisher: () => 'Dribbble'
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-dribbble'

  return rules
}

module.exports.test = test
