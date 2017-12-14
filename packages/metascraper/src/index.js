'use strict'

const { isUrl } = require('@metascraper/helpers')
const { isEmpty } = require('lodash')

const loadHTML = require('./load-html')
const getData = require('./get-data')

const rules = [
  require('metascraper-author'),
  require('metascraper-date'),
  require('metascraper-description'),
  require('metascraper-image'),
  require('metascraper-logo'),
  require('metascraper-publisher'),
  require('metascraper-title'),
  require('metascraper-url')
]

module.exports = async ({ url, html } = {}) => {
  if (!isUrl(url)) throw new TypeError('You need to provide a valid url.')
  if (isEmpty(html)) {
    throw new TypeError('You need to provide a valid HTML markup.')
  }

  const htmlDom = loadHTML(html)
  return getData({ rules, htmlDom, url })
}
