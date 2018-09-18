'use strict'

const { isUrl } = require('@metascraper/helpers')
const whoops = require('whoops')

const mergeRules = require('./merge-rules')
const loadRules = require('./load-rules')
const loadHTML = require('./load-html')
const getData = require('./get-data')

const MetascraperError = whoops('MetascraperError')

module.exports = rules => {
  const loadedRules = loadRules(rules)
  return async ({ url, html, rules: inlineRules } = {}) => {
    if (!isUrl(url)) {
      throw new MetascraperError({
        message: 'Need to provide a valid URL.',
        code: 'INVALID_URL'
      })
    }

    return getData({
      url,
      htmlDom: loadHTML(html),
      rules: mergeRules(inlineRules, loadedRules)
    })
  }
}
