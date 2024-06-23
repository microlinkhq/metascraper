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
    dom,
    rules: inlineRules,
    validateUrl = true,
    ...props
  } = {}) => {
    if (validateUrl && !isUrl(url)) {
      throw new MetascraperError({
        message: 'Need to provide a valid URL.',
        code: 'INVALID_URL'
      })
    }
    const htmlDom = dom || load(html, { baseURI: url })

    return getData({
      url,
      htmlDom,
      rules: mergeRules(inlineRules, loadedRules),
      ...props
    })
  }
}
