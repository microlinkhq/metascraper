'use strict'

const { isUrl } = require('@metascraper/helpers')
const whoops = require('whoops')

const mergeRules = require('./merge-rules')
const loadRules = require('./load-rules')
const loadHTML = require('./load-html')
const loadJsonLd = require('./load-jsonld')
const getData = require('./get-data')

const MetascraperError = whoops('MetascraperError')

module.exports = rules => {
  const loadedRules = loadRules(rules)
  return async ({ url, html, rules: inlineRules, escape = true } = {}) => {
    if (!isUrl(url)) {
      throw new MetascraperError({
        message: 'Need to provide a valid URL.',
        code: 'INVALID_URL'
      })
    }
    const htmlDom = loadHTML(html)
    const jsonLd = loadJsonLd(htmlDom)
    return getData({
      url,
      escape,
      htmlDom,
      jsonLd,
      rules: mergeRules(inlineRules, loadedRules)
    })
  }
}
