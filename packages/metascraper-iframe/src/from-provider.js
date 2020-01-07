'use strict'

const { memoizeOne } = require('@metascraper/helpers')
const pReflect = require('p-reflect')
const oEmbed = require('oembed-spec')
const { get } = require('lodash')

const findProvider = memoizeOne(oEmbed.findProvider)

const { fetchProvider } = oEmbed

const fromProvider = gotOpts => async ({ url, meta, htmlDom, ...opts }) => {
  const provider = findProvider(url)
  const { value } = await pReflect(fetchProvider(provider, url, opts, gotOpts))
  return get(value, 'html', null)
}

fromProvider.test = url => findProvider(url) !== undefined

module.exports = fromProvider
