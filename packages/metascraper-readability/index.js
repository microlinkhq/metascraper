'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')

const Readability = require('readability')
const jsdom = require('jsdom')

const { JSDOM } = jsdom

const virtualConsole = new jsdom.VirtualConsole()

const readability = memoizeOne(($, url) => {
  const dom = new JSDOM($.html(), { virtualConsole, url })
  const reader = new Readability(dom.window.document)
  return reader.parse()
})

const getReadbility = composeRule(readability)

module.exports = () => {
  return {
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    author: getReadbility({ from: 'byline', to: 'author' }),
    title: getReadbility({ from: 'title' })
  }
}

module.exports.readability = readability
