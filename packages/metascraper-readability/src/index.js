'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')

const { Readability } = require('@mozilla/readability')
const { JSDOM, VirtualConsole } = require('jsdom')

const parseReader = reader => {
  try {
    return reader.parse()
  } catch (_) {
    return {}
  }
}

const readability = memoizeOne((url, html) => {
  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() })
  const reader = new Readability(dom.window.document)
  return parseReader(reader)
}, memoizeOne.EqualityFirstArgument)

const getReadbility = composeRule(($, url) => readability(url, $.html()))

module.exports = () => {
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
