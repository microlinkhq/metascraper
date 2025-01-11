'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const { Readability } = require('@mozilla/readability')

const parseReader = reader => {
  try {
    return reader.parse()
  } catch (_) {
    return {}
  }
}

const defaultGetDocument = ({ url, html }) => {
  const { Window } = require('happy-dom')
  const window = new Window({ url })
  const document = window.document
  document.documentElement.innerHTML = html
  return document
}

module.exports = ({ getDocument = defaultGetDocument } = {}) => {
  const readability = memoizeOne((url, html, getDocument) => {
    const document = getDocument({ url, html })
    const reader = new Readability(document)
    return parseReader(reader)
  }, memoizeOne.EqualityFirstArgument)

  const getReadbility = composeRule(($, url) =>
    readability(url, $.html(), getDocument)
  )

  return {
    author: getReadbility({ from: 'byline', to: 'author' }),
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    lang: getReadbility({ from: 'lang' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    title: getReadbility({ from: 'title' })
  }
}
