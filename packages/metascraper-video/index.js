'use strict'

const {
  $jsonld,
  extension,
  toRule,
  url: urlFn,
  video
} = require('@metascraper/helpers')

const { chain, isEqual } = require('lodash')

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

module.exports = () => {
  return {
    image: [toUrl($ => $('video').attr('poster'))],
    video: [
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
      toVideo($jsonld('contentUrl')),
      toVideoFromDom($ => $('video').get()),
      toVideoFromDom($ => $('video > source').get())
    ]
  }
}
