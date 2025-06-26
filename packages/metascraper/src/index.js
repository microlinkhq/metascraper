'use strict'

const { isUrl } = require('@metascraper/helpers')
const { load } = require('cheerio')
const whoops = require('whoops')

const { loadRules, mergeRules } = require('./rules')
const getData = require('./get-data')

const MetascraperError = whoops('MetascraperError')

module.exports = rules => {
  const loadedRules = loadRules(rules)
  return async ({
    url,
    html = '',
    htmlDom,
    rules: inlineRules,
    validateUrl = true,
    omitPropNames = new Set(),
    pickPropNames,
    ...props
  } = {}) => {
    if (validateUrl && !isUrl(url)) {
      throw new MetascraperError({
        message: 'Need to provide a valid URL.',
        code: 'INVALID_URL'
      })
    }

    return getData({
      url,
      htmlDom: htmlDom ?? load(html, { baseURI: url }),
      rules: mergeRules(inlineRules, loadedRules, omitPropNames, pickPropNames),
      ...props
    })
  }
}
