'use strict'

const {
  $filter,
  author,
  description,
  createWrap,
  createWard
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

const isValidUrl = url => getVideoInfo(url).service === 'youtube'

const ward = createWard(({ url }) => isValidUrl(url))

module.exports = () => ({
  author: [
    ward(wrapAuthor($ => $('#owner-name').text())),
    ward(wrapAuthor($ => $('#channel-title').text())),
    ward(wrapAuthor($ => $filter($, $('[class*="user-info" i]'))))
  ],
  description: [ward(wrapDescription($ => $('#description').text()))],
  publisher: [ward(() => 'YouTube')],
  image: [
    ward(({ htmlDom, url }) => {
      const { id } = getVideoId(url)
      return id && getThumbnailUrl(id)
    })
  ]
})

module.exports.isValidUrl = isValidUrl
