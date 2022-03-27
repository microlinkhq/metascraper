'use strict'

const asyncMemoizeOne = require('async-memoize-one')
const { getDomainWithoutSuffix } = require('tldts')
const memoize = require('@keyvhq/memoize')
const got = require('got')

const {
  composeRule,
  memoizeOne,
  normalizeUrl
} = require('@metascraper/helpers')

const { getPreview } = require('spotify-url-info')((url, opts) =>
  got(url, opts).then(res => ({
    text: () => Promise.resolve(res.body)
  }))
)

const createSpotify = ({ gotOpts, keyvOpts }) => {
  const spotify = async url => {
    try {
      const result = await getPreview(url, gotOpts)
      return result
    } catch (_) {
      return {}
    }
  }

  return asyncMemoizeOne(memoize(spotify, keyvOpts))
}

const isValidUrl = memoizeOne(url => getDomainWithoutSuffix(url) === 'spotify')

module.exports = ({ gotOpts, keyvOpts } = {}) => {
  const spotify = createSpotify({ gotOpts, keyvOpts })
  const getSpotify = composeRule(($, url) => spotify(normalizeUrl(url)))

  const rules = {
    audio: getSpotify({ from: 'audio', ext: 'mp3' }),
    author: getSpotify({ from: 'artist', to: 'author' }),
    date: getSpotify({ from: 'date' }),
    description: getSpotify({ from: 'description' }),
    image: getSpotify({ from: 'image' }),
    publisher: () => 'Spotify',
    title: getSpotify({ from: 'title' }),
    url: getSpotify({ from: 'link', to: 'url' })
  }

  rules.test = ({ url }) => isValidUrl(url)

  return rules
}

module.exports.isValidUrl = isValidUrl
