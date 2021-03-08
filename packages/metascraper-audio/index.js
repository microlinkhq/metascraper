'use strict'

const {
  $filter,
  $jsonld,
  audio,
  has,
  isMime,
  loadIframe,
  normalizeUrl,
  toRule
} = require('@metascraper/helpers')

const cheerio = require('cheerio')
const got = require('got')

const toAudio = toRule(audio)

const withContentType = (url, contentType) =>
  isMime(contentType, 'audio') ? url : false

const audioRules = [
  toAudio($ => $('meta[property="og:audio:secure_url"]').attr('content')),
  toAudio($ => $('meta[property="og:audio"]').attr('content')),
  toAudio($ => {
    const contentType =
      $('meta[name="twitter:player:stream:content_type"]').attr('content') ||
      $('meta[property="twitter:player:stream:content_type"]').attr('content')

    const streamUrl =
      $('meta[name="twitter:player:stream"]').attr('content') ||
      $('meta[property="twitter:player:stream"]').attr('content') ||
      $('meta[name="twitter:player"]').attr('content') ||
      $('meta[property="twitter:player"]').attr('content')

    return contentType ? withContentType(streamUrl, contentType) : streamUrl
  }),
  toAudio($jsonld('contentUrl')),
  toAudio($ => $('audio').attr('src')),
  toAudio($ => $('audio > source').attr('src')),
  ({ htmlDom: $ }) => $filter($, $('a'), el => audio(el.attr('href')))
]

const _getIframe = async (url, { src }) => {
  const iframe = await loadIframe(url, `<iframe src="${src}"></iframe>`)
  return iframe.document.documentElement.outerHTML
}

module.exports = ({ getIframe = _getIframe, gotOpts } = {}) => ({
  audio: [
    ...audioRules,
    async ({ htmlDom: $, url }) => {
      const iframe = $('iframe')
      if (iframe.length === 0) return

      const src = $filter($, iframe, el => normalizeUrl(url, el.attr('src')))
      if (!src) return

      const html = await getIframe(url, { src })
      const htmlDom = cheerio.load(html)

      let index = 0
      let value

      do {
        const rule = audioRules[index++]
        value = await rule({ htmlDom, url })
      } while (!has(value) && index < audioRules.length)

      return value
    },
    async ({ htmlDom: $, url }) => {
      const playerUrl =
        $('meta[name="twitter:player"]').attr('content') ||
        $('meta[property="twitter:player"]').attr('content')

      if (!playerUrl) return

      const html = await got(playerUrl, { resolveBodyOnly: true, ...gotOpts })
      const htmlDom = cheerio.load(html)

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
