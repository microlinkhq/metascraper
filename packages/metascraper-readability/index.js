'use strict'

const helpers = require('@metascraper/helpers')
const { eq, get, invoke } = require('lodash')
const Readability = require('readability')
const memoizeOne = require('memoize-one')
const { JSDOM } = require('jsdom')

const memoFn = (newArgs, oldArgs) => eq(newArgs.url, oldArgs.url)

const readability = memoizeOne((html, opts) => {
  const dom = new JSDOM(html, opts)
  const reader = new Readability(dom.window.document)
  return reader.parse()
}, memoFn)

const getReadbility = ({ from, to = from }) => ({ htmlDom, url }) => {
  const data = readability(htmlDom.html(), { url })
  const value = get(data, from)
  return invoke(helpers, to, value)
}

module.exports = () => {
  return {
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    author: getReadbility({ from: 'byline', to: 'author' }),
    title: getReadbility({ from: 'title' })
  }
}

module.exports.readability = readability
