'use strict'

const { extract, hasProvider } = require('oembed-parser')
const { memoizeOne } = require('@metascraper/helpers')
const pReflect = require('p-reflect')
const { get } = require('lodash')

const fromProvider = async ({ url, meta, htmlDom, ...opts }) => {
  const { value } = await pReflect(extract(findProviderUrl(url), opts))
  return get(value, 'html', null)
}

const findProviderUrl = memoizeOne(url => {
  let providerUrl

  // build up a list of URL variations to test against because the oembed
  // providers list is not always up to date with scheme or www vs non-www
  const baseUrl = url.replace(/^\/\/|^https?:\/\/(?:www\.)?/, '')
  const testUrls = [
    `http://${baseUrl}`,
    `https://${baseUrl}`,
    `http://www.${baseUrl}`,
    `https://www.${baseUrl}`
  ]

  for (const testUrl of testUrls) {
    if (hasProvider(testUrl)) {
      providerUrl = testUrl
      break
    }
  }

  return providerUrl
})

fromProvider.test = url => !!findProviderUrl(url)

module.exports = fromProvider
