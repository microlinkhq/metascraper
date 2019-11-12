'use strict'

const { extract, hasProvider } = require('oembed-parser')
const { memoizeOne } = require('@metascraper/helpers')

const iframe = async ({ url, meta, htmlDom, ...opts }) => {
  try {
    const oembed = await extract(url, opts)
    return oembed.html
  } catch (err) {
    return null
  }
}

const isValidUrl = memoizeOne(({ url }) => hasProvider(url))

module.exports = () => {
  const rules = { iframe }
  rules.test = isValidUrl
  return rules
}

module.exports.isValidUrl = isValidUrl
