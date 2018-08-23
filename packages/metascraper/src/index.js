'use strict'

const { isUrl } = require('@metascraper/helpers')
const { isEmpty } = require('lodash')

const mergeRules = require('./merge-rules')
const loadRules = require('./load-rules')
const loadHTML = require('./load-html')
const getData = require('./get-data')

module.exports = rules => {
  const loadedRules = loadRules(rules)
  return async ({ url, html, rules: inlineRules } = {}) => {
    if (!isUrl(url)) throw new TypeError('You need to provide a valid url.')
    if (isEmpty(html)) {
      throw new TypeError('You need to provide a valid HTML markup.')
    }
    return getData({
      url,
      htmlDom: loadHTML(html),
      rules: mergeRules(inlineRules, loadedRules)
    })
  }
}
