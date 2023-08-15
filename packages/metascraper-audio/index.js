'use strict'

const {
  $filter,
  $jsonld,
  audio,
  findRule,
  has,
  $twitter,
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
  ({ url, htmlDom: $ }) => {
    const src = $twitter($, 'twitter:player:stream')
    return src
      ? audio(src, {
        url,
        type: $twitter($, 'twitter:player:stream:content_type')
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
    audio: audioRules.concat(
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

        return srcs.length > 0
          ? pReflect(
            Promise.any(
              srcs.map(async src => {
                const htmlDom = await getIframe(url, $, { src })
                const result = await findRule(audioRules, { htmlDom, url })
                if (!has(result)) throw TypeError('no result')
                return result
              })
            )
          ).then(({ value }) => value)
          : undefined
      },
      async ({ htmlDom: $, url }) => {
        const src = $twitter($, 'twitter:player')
        return src
          ? findRule(audioRules, {
            htmlDom: await getIframe(url, $, { src }),
            url
          })
          : undefined
      }
    )
  }
}
