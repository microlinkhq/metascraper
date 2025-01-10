'use strict'

const {
  $jsonld,
  findRule,
  has,
  loadIframe,
  normalizeUrl,
  toRule,
  url: urlFn,
  video
} = require('@metascraper/helpers')

const pReflect = require('p-reflect')

const { chain, find, isEqual } = require('lodash')

const toUrl = toRule(urlFn)

const toVideo = toRule(video)

const toVideoFromDom = toRule((domNodes, opts) => {
  const values = chain(domNodes)
    .map(domNode => ({
      src: domNode?.attribs.src,
      type: chain(domNode)
        .get('attribs.type')
        .split(';')
        .get(0)
        .split('/')
        .get(1)
        .value()
    }))
    .uniqWith(isEqual)
    .value()

  let result
  find(
    values,
    ({ src, type }) => (result = video(src, Object.assign({ type }, opts)))
  )
  return result
})

const videoRules = [
  ({ url, htmlDom: $ }) => {
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
  ({ url, htmlDom: $ }) => {
    const src = $('meta[name="twitter:player:stream"]').attr('content')
    return src
      ? video(src, {
        url,
        type: $('meta[name="twitter:player:stream:content_type"]').attr(
          'content'
        )
      })
      : undefined
  },
  toVideo($jsonld('contentUrl')),
  toVideoFromDom($ => $('video').get()),
  toVideoFromDom($ => $('video > source').get())
]

const imageRules = [toUrl($ => $('video').attr('poster'))]

const _getIframe = (url, $, { src }) =>
  loadIframe(url, $.load(`<iframe src="${src}"></iframe>`))

const withIframe = (rules, getIframe) =>
  rules.concat(
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
            const result = await findRule(rules, { htmlDom, url })
            if (!has(result)) throw TypeError('no result')
            return result
          })
        )
      ).then(({ value }) => value)
    },
    async ({ htmlDom: $, url }) => {
      const src = $('meta[name="twitter:player"]').attr('content')
      return src
        ? findRule(rules, {
          htmlDom: await getIframe(url, $, { src }),
          url
        })
        : undefined
    }
  )

module.exports = ({ getIframe = _getIframe } = {}) => {
  const rules = {
    image: withIframe(imageRules, getIframe),
    video: withIframe(videoRules, getIframe)
  }

  rules.pkgName = 'metascraper-video'

  return rules
}
