'use strict'

const { composeRule, memoizeOne } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { getDomainWithoutSuffix } = require('tldts')
const got = require('got')

const { getPreview } = require('spotify-url-info')((url, opts) =>
  got(url, opts).then(res => ({
    text: () => Promise.resolve(res.body)
  }))
)

const spotify = asyncMemoizeOne(async url => {
  try {
    return await getPreview(url)
  } catch (_) {
    return {}
  }
})

const isValidUrl = memoizeOne(url => getDomainWithoutSuffix(url) === 'spotify')

module.exports = ({ gotOpts } = {}) => {
  const getSpotify = composeRule(($, url) => spotify(url, gotOpts))

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
