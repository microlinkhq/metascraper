'use strict'

const { createValidator } = require('@metascraper/helpers')
const Readability = require('readability')
const memoizeOne = require('memoize-one')
const { JSDOM } = require('jsdom')

const memoFn = (newArgs, oldArgs) => newArgs.url === oldArgs.url

const readability = memoizeOne(({ htmlDom, url }) => {
  const dom = new JSDOM(htmlDom.html(), { url })
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
