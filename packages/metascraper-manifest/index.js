'use strict'

const { normalizeUrl, logo, composeRule } = require('@metascraper/helpers')
const { dataUriToBuffer } = require('data-uri-to-buffer')
const asyncMemoizeOne = require('async-memoize-one')
const { chain, toLower } = require('lodash')
const memoize = require('@keyvhq/memoize')

const got = require('got')

const parseSize = str => {
  const parse = Number(
    chain(str)
      .split('x')
      .first()
      .value()
  )
  return Number.isNaN(parse) ? 0 : parse
}

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
    if (!manifestUrl) return

    if (manifestUrl.startsWith('data')) {
      try {
        const result = JSON.parse(dataUriToBuffer(manifestUrl))
        return result
      } catch (_) {
        return undefined
      }
    }

    return fetchManifest(normalizeUrl(url, manifestUrl))
  }

  const manifest = composeRule(toManifest)

  return {
    lang: manifest({ from: 'lang' }),
    description: manifest({ from: 'description' }),
    publisher: manifest({ from: 'short_name', to: 'publisher' }),
    logo: async ({ htmlDom, url }) => {
      const manifest = await toManifest(htmlDom, url)
      if (!manifest) return

      const iconSrc = chain(manifest)
        .get('icons')
        .filter(icon => toLower(icon.purpose) !== 'monochrome')
        .map(props => Object.assign(props, { size: parseSize(props.sizes) }))
        .orderBy('size', 'desc')
        .first()
        .get('src')
        .value()

      return logo(iconSrc, { url })
    }
  }
}

module.exports.parseSize = parseSize
