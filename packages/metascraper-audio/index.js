'use strict'

const { isMime, audio, toRule } = require('@metascraper/helpers')

const toAudio = toRule(audio)

const withContentType = (url, contentType) =>
  isMime(contentType, 'audio') ? url : false

module.exports = () => ({
  audio: [
    toAudio($ => $('meta[property="og:audio:secure_url"]').attr('content')),
    toAudio($ => $('meta[property="og:audio"]').attr('content')),
    toAudio($ => {
      const contentType = $(
        'meta[property="twitter:player:stream:content_type"]'
      ).attr('content')
      const streamUrl = $('meta[property="twitter:player:stream"]').attr(
        'content'
      )
      return contentType ? withContentType(streamUrl, contentType) : streamUrl
    }),
    toAudio($ => $('audio').attr('src')),
    toAudio($ => $('audio > source').attr('src'))
  ]
})
