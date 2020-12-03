'use strict'

const { composeRule, memoizeOne } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { getDomainWithoutSuffix } = require('tldts')
const { getPreview } = require('spotify-url-info')

const spotify = asyncMemoizeOne(async url => {
  try {
    return await getPreview(url)
  } catch (_) {
    return {}
  }
})

const getSpotify = composeRule((htmlDom, url) => spotify(url))

const isValidUrl = memoizeOne(url => getDomainWithoutSuffix(url) === 'spotify')

module.exports = () => {
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
