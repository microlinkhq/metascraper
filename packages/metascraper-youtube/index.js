'use strict'

const { $filter, author } = require('@metascraper/helpers')
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

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return author(value)
}

module.exports = () => ({
  author: [
    wrap($ => $('#owner-name').text()),
    wrap($ => $('#channel-title').text()),
    wrap($ => $filter($, $('[class*="user-info" i]')))
  ],
  publisher: [({ url }) => getVideoId(url).service === 'youtube' && 'YouTube'],
  image: [
    ({ htmlDom, url }) => {
      const { id, service } = getVideoId(url)
      return service === 'youtube' && id && getThumbnailUrl(id)
    }
  ]
})
