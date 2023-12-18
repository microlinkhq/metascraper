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

const { find, chain, isEqual } = require('lodash')
const pReflect = require('p-reflect')

const toAudio = toRule(audio)

const toAudioFromDom = toRule((domNodes, opts) => {
  const values = chain(domNodes)
    .map(domNode => ({
      src: domNode?.attribs.src,
      type: chain(domNode)
        .get('attribs.type')
        .split(';')
        .get(0)
        .split('/')
        .get(1)
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        .replace('mpeg', 'mp3')
        .value()
    }))
    .uniqWith(isEqual)
    .value()

  let result
  find(
    values,
    ({ src, type }) => (result = audio(src, Object.assign({ type }, opts)))
  )
  return result
})

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
  toAudioFromDom($ => $('audio').get()),
  toAudioFromDom($ => $('audio > source').get()),
  ({ htmlDom: $ }) => $filter($, $('a[href]'), el => audio(el.attr('href')))
]

const _getIframe = (url, $, { src }) =>
  loadIframe(url, $.load(`<iframe src="${src}"></iframe>`))

module.exports = ({ getIframe = _getIframe } = {}) => {
  return {
    audio: audioRules.concat(
      async ({ htmlDom: $, url }) => {
        const srcs = [
          ...new $('iframe[src^="http"], iframe[src^="/"]')
            .map((_, element) => $(element).attr('src'))
            .get()
            .map(src => normalizeUrl(url, src))
        ]
        if (srcs.length === 0) return
        return pReflect(
          Promise.any(
            srcs.map(async src => {
              const htmlDom = await getIframe(url, $, { src })
              const result = await findRule(audioRules, { htmlDom, url })
              if (!has(result)) throw TypeError('no result')
              return result
            })
          )
        ).then(({ value }) => value)
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
