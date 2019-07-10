'use strict'

const {
  $filter,
  author,
  description,
  createWrap
} = require('@metascraper/helpers')

const isReachable = require('is-reachable')
const getVideoId = require('get-video-id')
const memoizeOne = require('memoize-one')
const pLocate = require('p-locate')

const THUMBAILS_RESOLUTIONS = [
  'maxresdefault.jpg',
  'sddefault.jpg',
  'hqdefault.jpg',
  'mqdefault.jpg',
  'default.jpg'
]

const getThumbnailUrl = id => {
  const urls = THUMBAILS_RESOLUTIONS.map(
    res => `https://img.youtube.com/vi/${id}/${res}`
  )
  return pLocate(urls, isReachable)
}

const wrapAuthor = createWrap(author)

const wrapDescription = createWrap(description)

const getVideoInfo = memoizeOne(getVideoId)

const isValidUrl = memoizeOne(url => getVideoInfo(url).service === 'youtube')

module.exports = () => {
  const rules = {
    author: [
      wrapAuthor($ => $('#owner-name').text()),
      wrapAuthor($ => $('#channel-title').text()),
      wrapAuthor($ => $filter($, $('[class*="user-info" i]')))
    ],
    description: [wrapDescription($ => $('#description').text())],
    publisher: [() => 'YouTube'],
    image: [
      ({ htmlDom, url }) => {
        const { id } = getVideoId(url)
        return id && getThumbnailUrl(id)
      }
    ]
  }

  rules.test = ({ url }) => isValidUrl(url)

  return rules
}

module.exports.isValidUrl = isValidUrl
