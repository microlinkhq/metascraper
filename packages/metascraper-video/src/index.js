'use strict'

const {
  $jsonld,
  $meta,
  createGetIframeCached,
  defaultGetIframe,
  toRule,
  url: urlFn,
  video,
  withIframe
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
      $meta('og:video:secure_url')($) ||
      $meta('og:video:url')($) ||
      $meta('og:video')($)

    return src
      ? video(src, {
        url,
        type: $meta('og:video:type')($)
      })
      : undefined
  },
  ({ url, htmlDom: $ }) => {
    const src = $meta('twitter:player:stream')($)
    return src
      ? video(src, {
        url,
        type: $meta('twitter:player:stream:content_type')($)
      })
      : undefined
  },
  toVideo($jsonld('contentUrl')),
  toVideoFromDom($ => $('video').get()),
  toVideoFromDom($ => $('video > source').get())
]

const imageRules = [toUrl($ => $('video').attr('poster'))]

module.exports = ({ getIframe = defaultGetIframe } = {}) => {
  const getIframeCached = createGetIframeCached(getIframe)
  const rules = {
    image: withIframe(imageRules, getIframeCached, 'image'),
    video: withIframe(videoRules, getIframeCached, 'video')
  }

  rules.pkgName = 'metascraper-video'

  return rules
}
