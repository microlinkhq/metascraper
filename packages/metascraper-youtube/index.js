'use strict'

const isReachable = require('is-reachable')
const getVideoId = require('get-video-id')
const pLocate = require('p-locate')

const {
  $filter,
  author,
  description,
  toRule,
  memoizeOne
} = require('@metascraper/helpers')

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

const isValidUrl = memoizeOne(url => getVideoInfo(url).service === 'youtube')

module.exports = () => {
  const rules = {
    author: [
      toAuthor($ => $filter($, $('#owner-name'))),
      toAuthor($ => $filter($, $('#channel-title'))),
      toAuthor($ => $filter($, $('[class*="user-info" i]')))
    ],
    description: [toDescription($ => $filter($, $('#description')))],
    publisher: () => 'YouTube',
    image: [
      ({ url }) => {
        const { id } = getVideoId(url)
        return id && getThumbnailUrl(id)
      }
    ]
  }

  rules.test = ({ url }) => isValidUrl(url)

  return rules
}

module.exports.isValidUrl = isValidUrl
