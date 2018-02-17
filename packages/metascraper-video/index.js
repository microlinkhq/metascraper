'use strict'

const { getUrl, isUrl } = require('@metascraper/helpers')
const videoExtensions = require('video-extensions')
const { URL } = require('url')
const path = require('path')

const isVideoUrl = url => {
  const { pathname } = new URL(url)
  const ext = path.extname(pathname).substring(1)
  return videoExtensions.includes(ext)
}

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const createWrapper = fn => rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return fn(url, value)
}

const wrap = createWrapper((url, value) => isUrl(value) && getUrl(url, value))

const wrapVideo = createWrapper((url, value) => {
  if (!isUrl(value)) return false
  const urlValue = getUrl(url, value)
  return isVideoUrl(urlValue) && urlValue
})

/**
 * Rules.
 */

module.exports = () => ({
  image: [
    wrap($ => $('video').attr('poster'))
  ],
  video: [
    wrapVideo($ => $('meta[property="og:video:secure_url"]').attr('content')),
    wrapVideo($ => $('meta[property="og:video:url"]').attr('content')),
    wrapVideo($ => $('meta[property="og:video"]').attr('content')),
    wrapVideo($ => $('meta[property="twitter:player:stream"]').attr('content')),
    wrapVideo($ => $('video').attr('src')),
    wrapVideo($ => $('source').attr('src'))
  ]
})
