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
    title: getSpotify({ from: 'title' }),
    image: getSpotify({ from: 'image' }),
    audio: getSpotify({ from: 'audio', ext: 'mp3' }),
    url: getSpotify({ from: 'link', to: 'url' }),
    author: getSpotify({ from: 'artist', to: 'author' })
  }

  rules.test = ({ url }) => isValidUrl(url)

  return rules
}

module.exports.isValidUrl = isValidUrl
