'use strict'

const {
  $filter,
  $jsonld,
  audio,
  findRule,
  has,
  isMime,
  loadIframe,
  normalizeUrl,
  toRule
} = require('@metascraper/helpers')

const memoize = require('@keyvhq/memoize')
const pReflect = require('p-reflect')
const got = require('got')

const toAudio = toRule(audio)

const withContentType = (url, contentType) =>
  isMime(contentType, 'audio') ? url : false

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
  toAudio($ => {
    const contentType =
      $('meta[name="twitter:player:stream:content_type"]').attr('content') ||
      $('meta[property="twitter:player:stream:content_type"]').attr('content')

    const streamUrl =
      $('meta[name="twitter:player:stream"]').attr('content') ||
      $('meta[property="twitter:player:stream"]').attr('content')

    return contentType ? withContentType(streamUrl, contentType) : streamUrl
  }),
  toAudio($jsonld('contentUrl')),
  toAudio($ => $('audio').attr('src')),
  toAudio($ => $('audio > source').attr('src')),
  ({ htmlDom: $ }) => $filter($, $('a[href]'), el => audio(el.attr('href')))
]

const _getIframe = (url, $, { src }) =>
  loadIframe(url, $.load(`<iframe src="${src}"></iframe>`))

const createGetPlayer = ({ gotOpts, keyvOpts }) => {
  const getPlayer = async playerUrl => {
    const { value: response } = await pReflect(got(playerUrl, gotOpts))
    if (!response) return
    const contentType = response.headers['content-type']
    if (!contentType || !contentType.startsWith('text')) return
    return response.body
  }
  return memoize(getPlayer, keyvOpts, {
    value: value => (value === undefined ? null : value)
  })
}

module.exports = ({ getIframe = _getIframe, gotOpts, keyvOpts } = {}) => {
  const getPlayer = createGetPlayer({ gotOpts, keyvOpts })

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
      },
      async ({ htmlDom: $, url }) => {
        const playerUrl =
          $('meta[name="twitter:player"]').attr('content') ||
          $('meta[property="twitter:player"]').attr('content')
        if (!playerUrl) return

        const html = await getPlayer(normalizeUrl(url, playerUrl))
        if (!html) return

        const htmlDom = $.load(html)
        return findRule(audioRules, { htmlDom, url })
      }
    ]
  }
}
