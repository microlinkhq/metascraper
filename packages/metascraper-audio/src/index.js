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

const toAudio = toRule(audio)

const getMediaType = domNode => {
  const type = domNode?.attribs.type
  if (!type) return
  const mediaType = type.split(';')[0]?.split('/')[1]
  if (!mediaType) return
  if (mediaType === 'mpeg' || mediaType === 'mp4') return 'mp3'
  return mediaType
}

const toAudioFromDom = toRule((domNodes, opts) => {
  const seen = new Set()
  for (const domNode of domNodes) {
    const src = domNode?.attribs.src
    const type = getMediaType(domNode)
    const key = `${src}::${type}`
    if (seen.has(key)) continue
    seen.add(key)

    const result = audio(src, { type, ...opts })
    if (result !== undefined) return result
  }
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
    const src = $('meta[name="twitter:player:stream"]').attr('content')
    return src
      ? audio(src, {
        url,
        type: $('meta[name="twitter:player:stream:content_type"]').attr(
          'content'
        )
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

const createGetIframeCached = getIframe => {
  const cacheByHtmlDom = new WeakMap()

  return async (url, $, src) => {
    let cacheBySrc = cacheByHtmlDom.get($)
    if (!cacheBySrc) {
      cacheBySrc = new Map()
      cacheByHtmlDom.set($, cacheBySrc)
    }

    const cachedHtmlDom = cacheBySrc.get(src)
    if (cachedHtmlDom) return cachedHtmlDom

    const pendingHtmlDom = getIframe(url, $, { src }).catch(error => {
      cacheBySrc.delete(src)
      throw error
    })

    cacheBySrc.set(src, pendingHtmlDom)
    return pendingHtmlDom
  }
}

module.exports = ({ getIframe = _getIframe } = {}) => {
  const getIframeCached = createGetIframeCached(getIframe)
  const rules = {
    audio: audioRules.concat(
      async ({ htmlDom: $, url }) => {
        const srcs = $('iframe[src^="http"], iframe[src^="/"]')
          .map((_, element) => $(element).attr('src'))
          .get()
        if (srcs.length === 0) return
        const seenSrcs = new Set()
        for (const src of srcs) {
          try {
            const normalizedSrc = normalizeUrl(url, src)
            if (!normalizedSrc) continue
            if (seenSrcs.has(normalizedSrc)) continue
            seenSrcs.add(normalizedSrc)

            const htmlDom = await getIframeCached(url, $, normalizedSrc)
            const result = await findRule(audioRules, { htmlDom, url })
            if (has(result)) return result
          } catch (_) {}
        }
      },
      async ({ htmlDom: $, url }) => {
        const src = $('meta[name="twitter:player"]').attr('content')
        return src
          ? findRule(audioRules, {
            htmlDom: await getIframeCached(url, $, src),
            url
          })
          : undefined
      }
    )
  }

  rules.pkgName = 'metascraper-audio'

  return rules
}
