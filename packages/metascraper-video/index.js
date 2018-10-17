'use strict'

const {
  isMime,
  url: urlFn,
  isVideoUrl,
  extension
} = require('@metascraper/helpers')
const { chain } = require('lodash')

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

const wrap = createWrapper((value, url) => urlFn(value, { url }))

const wrapVideo = createWrapper((domNodes, url) => {
  const videoUrl = chain(domNodes)
    .map('attribs.src')
    .uniq()
    .orderBy(videoUrl => extension(videoUrl) === 'mp4', ['desc'])
    .first()
    .value()

  const urlValue = urlFn(videoUrl, { url })
  return isVideoUrl(urlValue) && urlValue
})

const withContentType = (url, contentType) =>
  (isMime(contentType, 'video') ? url : false)

/**
 * Rules.
 */

module.exports = () => ({
  image: [wrap($ => $('video').attr('poster'))],
  video: [
    wrapVideo($ => $('meta[property="og:video:secure_url"]').attr('content')),
    wrapVideo($ => $('meta[property="og:video"]').attr('content')),
    wrapVideo($ => {
      const contentType = $(
        'meta[property="twitter:player:stream:content_type"]'
      ).attr('content')
      const streamUrl = $('meta[property="twitter:player:stream"]').attr(
        'content'
      )
      return contentType ? withContentType(streamUrl, contentType) : streamUrl
    }),
    wrapVideo($ => $('video').get()),
    wrapVideo($ => $('video > source').get())
  ]
})
