'use strict'

const {
  chain,
  eq,
  find,
  has,
  isEmpty,
  isNil,
  negate,
  overEvery
} = require('lodash')

const {
  protocol: protocolFn,
  extension: extensionFn,
  author: authorFn,
  description: descriptionFn,
  title: titleFn,
  url: urlFn,
  lang,
  publisher
} = require('@metascraper/helpers')

const createGetVideoInfo = require('./get-video-info')

const isMIME = extension => ({ ext, url }) =>
  eq(ext, extension) || eq(extensionFn(url), extension)

const isProtocol = value => ({ protocol, url }) =>
  protocol ? eq(protocol, value) : protocolFn(url, value)

/* Most used formats
   Seet at https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility
*/
const isMp4 = isMIME('mp4')
const isMp3 = isMIME('mp3')
const isM4a = isMIME('m4a')
const isAac = isMIME('aac')
const isWav = isMIME('wav')

const isHttp = isProtocol('http')
const isHttps = isProtocol('https')

const hasAudio = item => has(item, 'abr')
const hasVideo = item => has(item, 'tbr')
const hastNotVideo = negate(hasVideo)

const getFormatUrls = ({ orderBy, filterBy }) => (formats, filters) => {
  const urls = chain(formats)
    .filter(overEvery(filters))
    .orderBy(orderBy, 'asc')
    .map('url')
    .filter(url => !eq(extensionFn(url), 'm3u8'))
    .value()

  return isEmpty(urls) ? false : urls
}

const getVideoUrls = getFormatUrls({ orderBy: 'tbr' })
const getAudioUrls = getFormatUrls({ orderBy: 'abr' })

const getVideo = ({ formats }) =>
  getVideoUrls(formats, [hasVideo, hasAudio, isMp4, isHttps]) ||
  getVideoUrls(formats, [hasVideo, hasAudio, isMp4, isHttp]) ||
  getVideoUrls(formats, [hasVideo, isMp4, isHttps]) ||
  getVideoUrls(formats, [hasVideo, isMp4, isHttp]) ||
  getVideoUrls(formats, [hasVideo, hasAudio, isHttps]) ||
  getVideoUrls(formats, [hasVideo, hasAudio, isHttp]) ||
  getVideoUrls(formats, [hasVideo, isHttps]) ||
  getVideoUrls(formats, [hasVideo, isHttp])

const getAudio = ({ formats }) =>
  getAudioUrls(formats, [hastNotVideo, hasAudio, isMp3, isHttps]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isAac, isHttps]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isM4a, isHttps]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isWav, isHttps]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isMp3, isHttp]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isAac, isHttp]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isM4a, isHttp]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isWav, isHttp]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isHttps]) ||
  getAudioUrls(formats, [hastNotVideo, hasAudio, isHttp])

const getAuthor = ({ uploader, creator, uploader_id: uploaderId }) =>
  find([creator, uploader, uploaderId], str => authorFn(str))

const getPublisher = ({ extractor_key: extractorKey }) =>
  publisher(extractorKey)

const getLang = ({ http_headers: headers }) => {
  const { 'Accept-Language': language } = headers
  return lang(language)
}

const getTitle = ({ title: mainTitle, alt_title: secondaryTitle }) =>
  find([mainTitle, secondaryTitle], titleFn)

const getDate = ({ timestamp }) =>
  !isNil(timestamp) && new Date(timestamp * 1000).toISOString()

const getImage = (url, { thumbnail }) => urlFn(thumbnail, { url })

const getDescription = ({ description }) => descriptionFn(description)

module.exports = opts => {
  const getVideoInfo = createGetVideoInfo(opts)

  return {
    audio: async ({ url }) => getAudio(await getVideoInfo(url)),
    author: async ({ url }) => getAuthor(await getVideoInfo(url)),
    date: async ({ url }) => getDate(await getVideoInfo(url)),
    description: async ({ url }) => getDescription(await getVideoInfo(url)),
    image: async ({ url }) => getImage(url, await getVideoInfo(url)),
    lang: async ({ url }) => getLang(await getVideoInfo(url)),
    publisher: async ({ url }) => getPublisher(await getVideoInfo(url)),
    title: async ({ url }) => getTitle(await getVideoInfo(url)),
    video: async ({ url }) => getVideo(await getVideoInfo(url))
  }
}

module.exports.getAudio = getAudio
module.exports.getImage = getImage
module.exports.getAuthor = getAuthor
module.exports.getDate = getDate
module.exports.getFormatUrls = getFormatUrls
module.exports.getPublisher = getPublisher
module.exports.getTitle = getTitle
module.exports.getVideo = getVideo
module.exports.getLang = getLang
