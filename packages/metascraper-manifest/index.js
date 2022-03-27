'use strict'

const { normalizeUrl, logo, composeRule } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { get, first, orderBy } = require('lodash')
const memoize = require('@keyvhq/memoize')
const got = require('got')

const createFetchManifest = ({ gotOpts, keyvOpts } = {}) => {
  const fetchManifest = async manifestUrl => {
    try {
      const { body: manifest } = await got(manifestUrl, {
        ...gotOpts,
        responseType: 'json'
      })
      return manifest
    } catch (_) {}
  }

  return asyncMemoizeOne(
    memoize(fetchManifest, keyvOpts, {
      value: value => (value === undefined ? null : value)
    })
  )
}

module.exports = opts => {
  const fetchManifest = createFetchManifest(opts)

  const toManifest = ($, url) => {
    const manifestUrl = $('link[rel="manifest"]').attr('href')
    if (!manifestUrl) return undefined
    return fetchManifest(normalizeUrl(url, manifestUrl))
  }

  const manifest = composeRule(toManifest)

  return {
    lang: manifest({ from: 'lang' }),
    description: manifest({ from: 'description' }),
    publisher: manifest({ from: 'short_name', to: 'publisher' }),
    logo: async ({ htmlDom, url }) => {
      const manifest = await toManifest(htmlDom, url)
      const icons = get(manifest, 'icons')
      const icon = first(orderBy(icons, 'sizes', 'desc')) || {}
      return logo(icon.src, { url })
    }
  }
}
