'use strict'

const { logo, composeRule, absoluteUrl } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { first, orderBy } = require('lodash')
const got = require('got')

const DEFAULT_GOT_OPTS = {
  responseType: 'json',
  timeout: 3000
}

const createFetchManifest = gotOpts =>
  asyncMemoizeOne(async (url, $) => {
    const manifest = $('link[rel="manifest"]').attr('href')
    if (!manifest) return undefined
    const manifestUrl = absoluteUrl(url, manifest)
    try {
      const { body: manifest } = await got(manifestUrl, {
        ...DEFAULT_GOT_OPTS,
        ...gotOpts
      })
      return manifest
    } catch (_) {}
  })

module.exports = opts => {
  const fetchManifest = createFetchManifest(opts)
  const manifest = composeRule(($, url) => fetchManifest(url, $))

  return {
    lang: manifest({ from: 'lang' }),
    description: manifest({ from: 'description' }),
    publisher: manifest({ from: 'short_name', to: 'publisher' }),
    logo: async ({ htmlDom, url }) => {
      const manifest = await fetchManifest(url, htmlDom)
      if (!manifest) return
      const { src: srcUrl } = first(orderBy(manifest.icons, 'sizes', 'desc'))
      const iconUrl = absoluteUrl(url, srcUrl)
      return logo(iconUrl)
    }
  }
}
