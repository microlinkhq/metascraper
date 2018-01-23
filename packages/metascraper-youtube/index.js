'use strict'

const getVideoId = require('get-video-id')

const { getValue, isUrl, titleize } = require('@metascraper/helpers')
const { isString } = require('lodash')

const getThumbnailUrl = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`

const getVideo = url => getVideoId(url) || {}

const wrap = rule => ({ htmlDom }) => {
  const value = rule(htmlDom)
  return isString(value) && !isUrl(value, {relative: false}) && titleize(
    value, {removeBy: true}
  )
}

module.exports = () => ({
  author: [
    wrap($ => $('#owner-name').text()),
    wrap($ => $('#channel-title').text()),
    wrap($ => getValue($, $('[class*="user-info"]')))
  ],
  publisher: [
    ({url}) => getVideo(url).service === 'youtube' && 'YouTube'
  ],
  image: [
    ({ htmlDom, url }) => {
      const {id, service} = getVideo(url)
      return service === 'youtube' && id && getThumbnailUrl(id)
    }
  ]
})
