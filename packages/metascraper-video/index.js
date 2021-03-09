'use strict'

const {
  $jsonld,
  extension,
  findRule,
  toRule,
  url: urlFn,
  video
} = require('@metascraper/helpers')

const { chain } = require('lodash')
const cheerio = require('cheerio')
const got = require('got')

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

const videoRules = [
  toVideo($ => $('meta[property="og:video:secure_url"]').attr('content')),
  toVideo($ => $('meta[property="og:video:url"]').attr('content')),
  toVideo($ => $('meta[property="og:video"]').attr('content')),
  toVideo($ => $('meta[name="twitter:player:stream"]').attr('content')),
  toVideo($ => $('meta[property="twitter:player:stream"]').attr('content')),
  toVideo($ => $('meta[name="twitter:player"]').attr('content')),
  toVideo($ => $('meta[property="twitter:player"]').attr('content')),
  toVideo($jsonld('contentUrl')),
  toVideoFromDom($ => $('video').get()),
  toVideoFromDom($ => $('video > source').get())
]

module.exports = ({ gotOpts } = {}) => ({
  image: [toUrl($ => $('video').attr('poster'))],
  video: [
    ...videoRules,
    async ({ htmlDom: $, url }) => {
      const playerUrl =
        $('meta[name="twitter:player"]').attr('content') ||
        $('meta[property="twitter:player"]').attr('content')

      if (!playerUrl) return

      const { headers } = await got.head(playerUrl, gotOpts)
      const contentType = headers['content-type']
      if (!contentType || !contentType.startsWith('text')) return

      const html = await got(playerUrl, { resolveBodyOnly: true, ...gotOpts })
      const htmlDom = cheerio.load(html)

      return findRule(videoRules, { htmlDom, url })
    }
  ]
})
