'use strict'

const { memoizeOne } = require('@metascraper/helpers')
const pReflect = require('p-reflect')
const oEmbed = require('oembed-spec')
const { get } = require('lodash')

const findProvider = memoizeOne(url => oEmbed.findProvider(url))

const { fetchProvider } = oEmbed

const fromProvider = gotOpts => async ({ url, iframe }) => {
  const provider = findProvider(url)
  const { value } = await pReflect(
    fetchProvider(provider, url, iframe, gotOpts)
  )
  return get(value, 'html', null)
}

fromProvider.test = url => !!findProvider(url)

module.exports = fromProvider
