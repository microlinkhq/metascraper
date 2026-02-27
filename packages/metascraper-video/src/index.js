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

const toUrl = toRule(urlFn)

const toVideo = toRule(video)

const getMediaType = domNode => {
  const type = domNode?.attribs.type
  if (!type) return
  return type.split(';')[0]?.split('/')[1]
}

const toVideoFromDom = toRule((domNodes, opts) => {
  const seen = new Set()
  for (const domNode of domNodes) {
    const src = domNode?.attribs.src
    const type = getMediaType(domNode)
    const key = `${src}::${type}`
    if (seen.has(key)) continue
    seen.add(key)

    const result = video(src, { type, ...opts })
    if (result !== undefined) return result
  }
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
      const srcs = $('iframe[src^="http"], iframe[src^="/"]')
        .map((_, element) => $(element).attr('src'))
        .get()
      if (srcs.length === 0) return
      for (const src of srcs) {
        try {
          const normalizedSrc = normalizeUrl(url, src)
          if (!normalizedSrc) continue
          const htmlDom = await getIframe(url, $, { src: normalizedSrc })
          const result = await findRule(rules, { htmlDom, url })
          if (has(result)) return result
        } catch (_) {}
      }
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
