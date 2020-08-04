'use strict'

const { composeRule } = require('@metascraper/helpers')
const { getPreview } = require('spotify-url-info')
const memoizeOne = require('memoize-one')
const { getDomainWithoutSuffix } = require('tldts')

const memoFn = (newArgs, oldArgs) => newArgs[1] === oldArgs[1]

const spotify = memoizeOne(async ($, url) => {
  try {
    return await getPreview(url)
  } catch (_) {
    return {}
  }
}, memoFn)

const getSpotify = composeRule(spotify)

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
