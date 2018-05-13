'use strict'

const { isUrl } = require('@metascraper/helpers')
const { isEmpty, partial } = require('lodash')

const {autoload: autoLoadRules, load: loadRules} = require('./load-rules')
const loadHTML = require('./load-html')
const getData = require('./get-data')

const create = loader => {
  const lazyRules = loader()
  return async ({url, html, rules: extraRules} = {}) => {
    const rules = await lazyRules

    if (!isUrl(url)) throw new TypeError('You need to provide a valid url.')
    if (isEmpty(html)) throw new TypeError('You need to provide a valid HTML markup.')

    const htmlDom = loadHTML(html)
    return getData({ rules, htmlDom, url })
  }
}

module.exports = create(autoLoadRules)
module.exports.load = rules => create(partial(loadRules, rules))
