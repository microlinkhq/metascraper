'use strict'

const { createValidator } = require('@metascraper/helpers')
const Readability = require('readability')
const memoizeOne = require('memoize-one')
const jsdom = require('jsdom')

const { JSDOM } = jsdom

const memoFn = (newArgs, oldArgs) => newArgs[0].url === oldArgs[0].url

const virtualConsole = new jsdom.VirtualConsole()

const readability = memoizeOne(({ htmlDom, url }) => {
  const dom = new JSDOM(htmlDom.html(), { virtualConsole, url })
  const reader = new Readability(dom.window.document)
  return reader.parse()
}, memoFn)

const getReadbility = createValidator(readability)

module.exports = () => {
  return {
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    author: getReadbility({ from: 'byline', to: 'author' }),
    title: getReadbility({ from: 'title' })
  }
}

module.exports.readability = readability
