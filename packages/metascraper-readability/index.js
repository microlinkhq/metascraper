'use strict'

const { composeRule } = require('@metascraper/helpers')
const Readability = require('readability')
const memoizeOne = require('memoize-one')
const jsdom = require('jsdom')

const { JSDOM } = jsdom

const memoFn = (newArgs, oldArgs) => newArgs[1] === oldArgs[1]

const virtualConsole = new jsdom.VirtualConsole()

const readability = memoizeOne(($, url) => {
  const dom = new JSDOM($.html(), { virtualConsole, url })
  const reader = new Readability(dom.window.document)
  return reader.parse()
}, memoFn)

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
