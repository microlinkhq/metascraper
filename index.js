'use strict'

const { flatten, isEmpty } = require('lodash')

const { getData, rules } = require('./src/get-data')
const loadHtml = require('./src/html')
const { isUrl } = require('./src/util')

module.exports = ({ plugins: rawPlugins } = {}) => {
  const plugins = flatten(rawPlugins)

  return async ({ url, html } = {}) => {
    if (!isUrl(url)) throw new TypeError('You need to provide a valid url.')
    if (isEmpty(html)) { throw new TypeError('You need to provide a valid HTML markup.') }

    const htmlDom = loadHtml(html)
    return getData({ plugins, rules, htmlDom, url })
  }
}
