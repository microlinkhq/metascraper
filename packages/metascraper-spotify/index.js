'use strict'

const asyncMemoizeOne = require('async-memoize-one')
const memoize = require('@keyvhq/memoize')
const got = require('got')

const {
  $jsonld,
  author,
  composeRule,
  description,
  memoizeOne,
  parseUrl,
  sanetizeUrl,
  toRule
} = require('@metascraper/helpers')

const toDescription = toRule(description)
const toAuthor = toRule(author)

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

  return asyncMemoizeOne(
    memoize(spotify, keyvOpts, {
      key: url => sanetizeUrl(url, { removeQueryParameters: true })
    })
  )
}

const test = memoizeOne(url => parseUrl(url).domainWithoutSuffix === 'spotify')

module.exports = ({ gotOpts, keyvOpts } = {}) => {
  const spotify = createSpotify({ gotOpts, keyvOpts })
  const getSpotify = composeRule((_, url) => spotify(url))

  const rules = {
    audio: getSpotify({ from: 'audio', ext: 'mp3' }),
    author: [
      toAuthor($jsonld('publisher')),
      getSpotify({ from: 'artist', to: 'author' })
    ],
    date: getSpotify({ from: 'date' }),
    description: [
      toDescription(($, url) => {
        const description = $('meta[property="og:description"]').attr('content')
        if (!description) return
        return description.includes('on Spotify. ')
          ? description.split('on Spotify. ')[1]
          : description
      }),

      getSpotify({ from: 'description' })
    ],
    image: getSpotify({ from: 'image' }),
    publisher: () => 'Spotify',
    title: getSpotify({ from: 'title' }),
    url: getSpotify({ from: 'link', to: 'url' })
  }

  rules.test = ({ url }) => test(url)

  return rules
}

module.exports.test = test
