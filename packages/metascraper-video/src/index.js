'use strict'

const {
  $jsonld,
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

module.exports = ({ getIframe = defaultGetIframe } = {}) => {
  const getIframeCached = createGetIframeCached(getIframe)
  const rules = {
    image: withIframe(imageRules, getIframeCached, 'image'),
    video: withIframe(videoRules, getIframeCached, 'video')
  }

  rules.pkgName = 'metascraper-video'

  return rules
}
