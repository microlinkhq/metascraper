'use strict'

const {
  $jsonld,
  extension,
  findRule,
  normalizeUrl,
  toRule,
  url: urlFn,
  video
} = require('@metascraper/helpers')

const { chain, isEqual } = require('lodash')
const memoize = require('@keyvhq/memoize')
const pReflect = require('p-reflect')
const got = require('got')

const toUrl = toRule(urlFn)

const toVideo = toRule(video)

const toVideoFromDom = toRule((domNodes, opts) => {
  const values = chain(domNodes)
    .map(domNode => ({
      src: domNode?.attribs.src,
      type: domNode?.attribs.type
    }))
    .uniqWith(isEqual)
    .orderBy(
      ({ src, type }) => extension(src) === 'mp4' || type?.includes('mp4'),
      ['desc']
    )
    .value()

  let result
  values.find(
    ({ src, type }) => (result = video(src, Object.assign({ type }, opts)))
  )
  return result
})

const videoRules = [
  async ({ url, htmlDom: $ }) => {
    const src =
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[property="og:video:url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content')

    return src
      ? video(src, {
        url,
        type: $('meta[property="og:video:type"]').attr('content')
      })
      : undefined
  },
  toVideo($ => $('meta[name="twitter:player:stream"]').attr('content')),
  toVideo($ => $('meta[property="twitter:player:stream"]').attr('content')),
  toVideo($jsonld('contentUrl')),
  toVideoFromDom($ => $('video').get()),
  toVideoFromDom($ => $('video > source').get())
]

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

module.exports = ({ gotOpts, keyvOpts } = {}) => {
  const getPlayer = createGetPlayer({ gotOpts, keyvOpts })

  return {
    image: [toUrl($ => $('video').attr('poster'))],
    video: [
      ...videoRules,
      async ({ htmlDom: $, url }) => {
        const playerUrl =
          $('meta[name="twitter:player"]').attr('content') ||
          $('meta[property="twitter:player"]').attr('content')

        if (!playerUrl) return
        const html = await getPlayer(normalizeUrl(url, playerUrl))
        if (!html) return
        const htmlDom = $.load(html)
        return findRule(videoRules, { htmlDom, url })
      }
    ]
  }
}
