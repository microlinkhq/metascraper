'use strict'

const {
  $filter,
  $jsonld,
  audio,
  has,
  isMime,
  loadIframe,
  toRule
} = require('@metascraper/helpers')

const cheerio = require('cheerio')

const toAudio = toRule(audio)

const withContentType = (url, contentType) =>
  isMime(contentType, 'audio') ? url : false

const audioRules = [
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
  toAudio($jsonld('contentUrl')),
  toAudio($ => $('audio').attr('src')),
  toAudio($ => $('audio > source').attr('src')),
  ({ htmlDom: $ }) => $filter($, $('a'), el => audio(el.attr('href')))
]

module.exports = () => ({
  audio: [
    ...audioRules,
    async ({ htmlDom: $, url }) => {
      const src = $('iframe').attr('src')
      if (!src) return

      const iframe = await loadIframe(url, `<iframe src="${src}"></iframe>`)
      const htmlDom = cheerio.load(iframe.document.documentElement.outerHTML)

      let index = 0
      let value

      do {
        const rule = audioRules[index++]
        value = await rule({ htmlDom, url })
      } while (!has(value) && index < audioRules.length)

      return value
    }
  ]
})
