'use strict'

const {
  $filter,
  $jsonld,
  audio,
  findRule,
  has,
  loadIframe,
  normalizeUrl,
  toRule
} = require('@metascraper/helpers')

const pReflect = require('p-reflect')

const toAudio = toRule(audio)

const audioRules = [
  ({ url, htmlDom: $ }) => {
    const src =
      $('meta[property="og:audio:secure_url"]').attr('content') ||
      $('meta[property="og:audio:url"]').attr('content') ||
      $('meta[property="og:audio"]').attr('content')

    return src
      ? audio(src, {
        url,
        type: $('meta[property="og:audio:type"]').attr('content')
      })
      : undefined
  },
  toAudio($jsonld('contentUrl')),
  toAudio($ => $('audio').attr('src')),
  toAudio($ => $('audio > source').attr('src')),
  ({ htmlDom: $ }) => $filter($, $('a[href]'), el => audio(el.attr('href')))
]

const _getIframe = (url, $, { src }) =>
  loadIframe(url, $.load(`<iframe src="${src}"></iframe>`))

module.exports = ({ getIframe = _getIframe } = {}) => {
  return {
    audio: [
      ...audioRules,
      async ({ htmlDom: $, url }) => {
        const iframe = $('iframe')
        if (iframe.length === 0) return

        const srcs = []

        iframe.each(function () {
          const src = $(this).attr('src')
          const normalizedUrl = normalizeUrl(url, src)
          if (
            typeof normalizedUrl === 'string' &&
            normalizedUrl.startsWith('http') &&
            srcs.indexOf(normalizedUrl) === -1
          ) {
            srcs.push(normalizedUrl)
          }
        })

        if (srcs.length === 0) return

        const { value } = await pReflect(
          Promise.any(
            srcs.map(async src => {
              const htmlDom = await getIframe(url, $, { src })
              const result = await findRule(audioRules, { htmlDom, url })
              if (!has(result)) throw TypeError('no result')
              return result
            })
          )
        )

        return value
      }
    ]
  }
}
