'use strict'

const { url: urlFn, extension, video } = require('@metascraper/helpers')
const { chain } = require('lodash')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrapRule = fn => rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return fn(value, url)
}

const toUrl = wrapRule((value, url) => urlFn(value, { url }))

const toVideo = wrapRule((input, url) => video(input, { url }))

const toVideoFromDom = wrapRule((domNodes, url) => {
  const videoUrl = chain(domNodes)
    .map('attribs.src')
    .uniq()
    .orderBy(videoUrl => extension(videoUrl) === 'mp4', ['desc'])
    .first()
    .value()

  return video(videoUrl, { url })
})

/**
 * Rules.
 */

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
