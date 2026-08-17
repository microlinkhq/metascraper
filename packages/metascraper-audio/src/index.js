'use strict'

const {
  $filter,
  $jsonld,
  $meta,
  audio,
  createGetIframeCached,
  defaultGetIframe,
  toRule,
  withIframe
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
      $meta('og:audio:secure_url')($) ||
      $meta('og:audio:url')($) ||
      $meta('og:audio')($)

    return src
      ? audio(src, {
        url,
        type: $meta('og:audio:type')($)
      })
      : undefined
  },
  ({ url, htmlDom: $ }) => {
    const src = $meta('twitter:player:stream')($)
    return src
      ? audio(src, {
        url,
        type: $meta('twitter:player:stream:content_type')($)
      })
      : undefined
  },
  toAudio($jsonld('contentUrl')),
  toAudioFromDom($ => $('audio').get()),
  toAudioFromDom($ => $('audio > source').get()),
  ({ htmlDom: $ }) => $filter($, $('a[href]'), el => audio(el.attr('href')))
]

module.exports = ({ getIframe = defaultGetIframe } = {}) => {
  const getIframeCached = createGetIframeCached(getIframe)
  const rules = {
    audio: withIframe(audioRules, getIframeCached, 'audio')
  }

  rules.pkgName = 'metascraper-audio'

  return rules
}
