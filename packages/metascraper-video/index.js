'use strict'

const {
  $jsonld,
  extension,
  findRule,
  normalizeUrl,
  toRule,
  url: urlFn,
  video
} = require('@metascraper/helpers')

const memoize = require('@keyvhq/memoize')
const pReflect = require('p-reflect')
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
  toVideo($ => $('meta[property="og:video:secure_url"]').prop('content')),
  toVideo($ => $('meta[property="og:video:url"]').prop('content')),
  toVideo($ => $('meta[property="og:video"]').prop('content')),
  toVideo($ => $('meta[name="twitter:player:stream"]').prop('content')),
  toVideo($ => $('meta[property="twitter:player:stream"]').prop('content')),
  toVideo($jsonld('contentUrl')),
  toVideoFromDom($ => $('video').get()),
  toVideoFromDom($ => $('video > source').get())
]

const createGetPlayer = ({ gotOpts, keyvOpts }) => {
  const getPlayer = async playerUrl => {
    const { value: response } = await pReflect(got(playerUrl, gotOpts))
    if (!response) return
    const contentType = response.headers['content-type']
    if (!contentType || !contentType.startsWith('text')) return
    return response.body
  }
  return memoize(getPlayer, keyvOpts, {
    value: value => (value === undefined ? null : value)
  })
}

module.exports = ({ gotOpts, keyvOpts } = {}) => {
  const getPlayer = createGetPlayer({ gotOpts, keyvOpts })

  return {
    image: [toUrl($ => $('video').prop('poster'))],
    video: [
      ...videoRules,
      async ({ htmlDom: $, url }) => {
        const playerUrl =
          $('meta[name="twitter:player"]').prop('content') ||
          $('meta[property="twitter:player"]').prop('content')

        if (!playerUrl) return
        const html = await getPlayer(normalizeUrl(url, playerUrl))
        if (!html) return
        const htmlDom = cheerio.load(html)
        return findRule(videoRules, { htmlDom, url })
      }
    ]
  }
}
