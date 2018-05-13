'use strict'

const { isUrl } = require('@metascraper/helpers')
const { isEmpty, partial } = require('lodash')

const {autoload: autoLoadRules, load: loadRules} = require('./load-rules')
const mergeRules = require('./merge-rules')
const loadHTML = require('./load-html')
const getData = require('./get-data')

const create = loader => {
  const lazyLoadedRules = loader()
  return async ({url, html, rules: inlineRules} = {}) => {
    const loadedRules = await lazyLoadedRules
    if (!isUrl(url)) throw new TypeError('You need to provide a valid url.')
    if (isEmpty(html)) throw new TypeError('You need to provide a valid HTML markup.')
    return getData({ url, htmlDom: loadHTML(html), rules: mergeRules(inlineRules, loadedRules) })
  }
}

module.exports = create(autoLoadRules)
module.exports.load = rules => create(partial(loadRules, rules))
