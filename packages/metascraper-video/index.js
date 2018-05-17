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
  return fn(value, url)
}

const wrap = createWrapper((value, url) => isUrl(value) && getUrl(url, value))

const validator = (value, url) => {
  if (!isUrl(value)) return false
  const urlValue = getUrl(url, value)
  return isVideoUrl(urlValue) && urlValue
}

const wrapVideo = createWrapper(validator)

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

module.exports.validator = validator
