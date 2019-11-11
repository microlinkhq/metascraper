'use strict'

const {
  $filter,
  author,
  description,
  toRule,
  memoizeOne
} = require('@metascraper/helpers')
const isReachable = require('is-reachable')
const getVideoId = require('get-video-id')
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

const toAuthor = toRule(author)

const toDescription = toRule(description)

const getVideoInfo = memoizeOne(getVideoId)

const isValidUrl = memoizeOne(
  ({ url }) => getVideoInfo(url).service === 'youtube'
)

module.exports = () => {
  const rules = {
    author: [
      toAuthor($ => $('#owner-name').text()),
      toAuthor($ => $('#channel-title').text()),
      toAuthor($ => $filter($, $('[class*="user-info" i]')))
    ],
    description: [toDescription($ => $('#description').text())],
    publisher: [() => 'YouTube'],
    image: [
      ({ htmlDom, url }) => {
        const { id } = getVideoId(url)
        return id && getThumbnailUrl(id)
      }
    ]
  }

  rules.test = isValidUrl

  return rules
}

module.exports.isValidUrl = isValidUrl
