'use strict'

const { url: urlFn, toRule, extension, video } = require('@metascraper/helpers')
const { chain } = require('lodash')

const toUrl = toRule(urlFn)
const toVideo = toRule(video)

const toVideoFromDom = toRule((domNodes, opts) => {
  const videoUrl = chain(domNodes)
    .map('attribs.src')
    .uniq()
    .orderBy(videoUrl => extension(videoUrl) === 'mp4', ['desc'])
    .first()
    .value()

  return video(videoUrl, opts)
})

module.exports = () => ({
  image: [toUrl($ => $('video').attr('poster'))],
  video: [
    toVideo($ => $('meta[property="og:video:secure_url"]').attr('content')),
    toVideo($ => $('meta[property="og:video:url"]').attr('content')),
    toVideo($ => $('meta[property="og:video"]').attr('content')),
    toVideo($ => $('meta[property="twitter:player:stream"]').attr('content')),
    toVideoFromDom($ => $('video').get()),
    toVideoFromDom($ => $('video > source').get())
  ]
})
