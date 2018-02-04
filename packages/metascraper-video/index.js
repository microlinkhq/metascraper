'use strict'

const { getUrl, isUrl } = require('@metascraper/helpers')
const videoExtensions = require('video-extensions')
const path = require('path')

const isVideoUrl = url => videoExtensions.includes(path.extname(url).substring(1))

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrapUrl = (url, value) => isUrl(value)
const wrapVideoUrl = (url, value) => wrapUrl(url, value) && isVideoUrl(value)

const createWrapper = validator => rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return validator(url, value) && getUrl(url, value)
}

const wrap = createWrapper(wrapUrl)
const wrapVideo = createWrapper(wrapVideoUrl)

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
