'use strict'

const { isMime, url: isUrl, extension, video } = require('@metascraper/helpers')
const { chain } = require('lodash')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const createWrap = fn => rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return fn(value, url)
}

const wrapUrl = createWrap((value, url) => isUrl(value, { url }))

const wrapVideo = createWrap((input, url) => video(input, { url }))

const wrapVideoNodes = createWrap((domNodes, url) => {
  const videoUrl = chain(domNodes)
    .map('attribs.src')
    .uniq()
    .orderBy(videoUrl => extension(videoUrl) === 'mp4', ['desc'])
    .first()
    .value()

  return video(videoUrl, { url })
})

const withContentType = (url, contentType) =>
  isMime(contentType, 'video') ? url : false

/**
 * Rules.
 */

module.exports = () => ({
  image: [wrapUrl($ => $('video').attr('poster'))],
  video: [
    wrapVideo($ => $('meta[property="og:video:secure_url"]').attr('content')),
    wrapVideo($ => $('meta[property="og:video:url"]').attr('content')),
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
    wrapVideoNodes($ => $('video').get()),
    wrapVideoNodes($ => $('video > source').get())
  ]
})
