'use strict'

const { isUrl } = require('@metascraper/helpers')
const { isEmpty } = require('lodash')

const loadRules = require('./load-rules')
const loadHTML = require('./load-html')
const getData = require('./get-data')

module.exports = async ({ url, html } = {}) => {
  const rules = await loadRules()

  if (!isUrl(url)) throw new TypeError('You need to provide a valid url.')
  if (isEmpty(html)) {
    throw new TypeError('You need to provide a valid HTML markup.')
  }

  const htmlDom = loadHTML(html)
  return getData({ rules, htmlDom, url })
}
