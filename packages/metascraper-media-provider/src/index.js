'use strict'

const {
  chain,
  eq,
  find,
  isEmpty,
  includes,
  isNil,
  overEvery
} = require('lodash')

const {
  extension: extensionFn,
  author: authorFn,
  description: descriptionFn,
  title: titleFn,
  url: urlFn,
  lang,
  publisher,
  protocol: protocolFn
} = require('@metascraper/helpers')

const createGetMedia = require('./get-media')

const isProtocol = value => ({ url }) => eq(protocolFn(url), value)

const isHttps = isProtocol('https')

const isMIME = extension => ({ ext, url }) =>
  ext ? eq(ext, extension) : eq(extensionFn(url), extension)

const isMp4 = isMIME('mp4')
const isMp3 = isMIME('mp3')
const isM4a = isMIME('m4a')
const isAac = isMIME('aac')
const isWav = isMIME('wav')

const hasCodec = prop => format => format[prop] !== 'none'

const hasAudioCodec = hasCodec('acodec')
const hasVideoCodec = hasCodec('vcodec')

const hasAudio = format =>
  isMp3(format) || isM4a(format) || isAac(format) || isWav(format)

const hasVideo = format =>
  isNil(format.format_note) || !isNil(format.height) || !isNil(format.width)

const notDownloadable = format => !includes(format.url, 'download=1')

const getFormatUrls = ({ orderBy }) => ({ formats }, filters) => {
  const url = chain(formats)
    .filter(overEvery(filters))
    .orderBy(orderBy, 'asc')
    .map('url')
    .last()
    .value()

  return isEmpty(url) ? false : url
}

const getVideoUrls = getFormatUrls({ orderBy: 'tbr' })

const getAudioUrls = getFormatUrls({ orderBy: 'abr' })

const getVideo = data => {
  const videoFilters = [
    hasVideo,
    isMp4,
    isHttps,
    notDownloadable,
    hasVideoCodec
  ]
  return (
    getVideoUrls(data, [...videoFilters, hasAudioCodec]) ||
    getVideoUrls(data, videoFilters)
  )
}

const getAudio = data =>
  getAudioUrls(data, [hasAudio, isHttps, notDownloadable, hasAudioCodec])

const getAuthor = ({ uploader, creator, uploader_id: uploaderId }) =>
  find([creator, uploader, uploaderId], str => authorFn(str))

const getPublisher = ({ extractor, extractor_key: extractorKey }) =>
  extractor !== 'generic' && publisher(extractorKey)

const getLang = ({ language, http_headers: headers = {} }) =>
  lang(language || headers['Accept-Language'])

const getTitle = ({ title: mainTitle, alt_title: secondaryTitle }) =>
  find([mainTitle, secondaryTitle], titleFn)

const getDate = ({ timestamp }) =>
  !isNil(timestamp) && new Date(timestamp * 1000).toISOString()

const getImage = (url, { thumbnail }) => urlFn(thumbnail, { url })

const getDescription = ({ description }) => descriptionFn(description)

module.exports = (opts = {}) => {
  const getMedia = createGetMedia(opts)

  return {
    audio: async ({ url }) => getAudio(await getMedia(url)),
    author: async ({ url }) => getAuthor(await getMedia(url)),
    date: async ({ url }) => getDate(await getMedia(url)),
    description: async ({ url }) => getDescription(await getMedia(url)),
    image: async ({ url }) => getImage(url, await getMedia(url)),
    lang: async ({ url }) => getLang(await getMedia(url)),
    publisher: async ({ url }) => getPublisher(await getMedia(url)),
    title: async ({ url }) => getTitle(await getMedia(url)),
    video: async ({ url }) => getVideo(await getMedia(url))
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
