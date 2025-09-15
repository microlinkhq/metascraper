'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { Readability } = require('@mozilla/readability')

const errorCapture =
  process.env.NODE_ENV === 'test' ? 'tryAndCatch' : 'processLevel'

const parseReader = (reader) => {
  const parsed = reader.parse()
  return parsed || {}
}


const getDocument = ({ url, html }) => {
  const { Window } = require('happy-dom')
  const window = new Window({
    url,
    settings: { errorCapture }
  })
  const document = window.document
  document.write(html)
  return document
}

const readability = asyncMemoizeOne((url, html, readabilityOpts) => {
  const document = getDocument({ url, html })
  const reader = new Readability(document, readabilityOpts)
  return parseReader(reader)
}, memoizeOne.EqualityFirstArgument)

module.exports = ({ readabilityOpts } = {}) => {
  const getReadbility = composeRule(($, url) =>
    readability(url, $.html(), readabilityOpts)
  )

  const rules = {
    author: getReadbility({ from: 'byline', to: 'author' }),
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    lang: getReadbility({ from: 'lang' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    title: getReadbility({ from: 'title' })
  }

  rules.pkgName = 'metascraper-readability'

  return rules
}

module.exports.readability = readability
