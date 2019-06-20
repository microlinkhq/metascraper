'use strict'

const { isMime, audio } = require('@metascraper/helpers')

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

const wrapAudio = createWrapper((value, url) => audio(value, { url }))

const withContentType = (url, contentType) =>
  isMime(contentType, 'audio') ? url : false

/**
 * Rules.
 */
module.exports = () => ({
  audio: [
    wrapAudio($ => $('meta[property="og:audio:secure_url"]').attr('content')),
    wrapAudio($ => $('meta[property="og:audio"]').attr('content')),
    wrapAudio($ => {
      const contentType = $(
        'meta[property="twitter:player:stream:content_type"]'
      ).attr('content')
      const streamUrl = $('meta[property="twitter:player:stream"]').attr(
        'content'
      )
      return contentType ? withContentType(streamUrl, contentType) : streamUrl
    }),
    wrapAudio($ => $('audio').attr('src')),
    wrapAudio($ => $('audio > source').attr('src'))
  ]
})
