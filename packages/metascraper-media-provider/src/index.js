'use strict'

const {
  overEvery,
  isEmpty,
  eq,
  has,
  get,
  chain,
  find,
  negate,
  isString
} = require('lodash')
const { isUrl, titleize } = require('@metascraper/helpers')
const path = require('path')

const getVideoInfo = require('./get-video-info')

const isMIME = ext => item =>
  eq(get(item, 'ext'), ext) ||
  path.extname(get(item, 'url')).startsWith(`.${ext}`)

const isMp4 = isMIME('mp4')
const isMp3 = isMIME('mp3')
const isM4a = isMIME('m4a')
const isAac = isMIME('aac')

const isHttp = item => eq(get(item, 'protocol'), 'http')
const isHttps = item => eq(get(item, 'protocol'), 'https')
const hasAudio = item => has(item, 'abr')
const hasVideo = item => has(item, 'tbr')

const getFormatUrls = orderBy => (videos, filters = []) => {
  const urls = chain(videos)
    .filter(overEvery(filters))
    .orderBy(orderBy, 'asc')
    .map('url')
    .filter(isUrl)
    .value()

  return isEmpty(urls) ? false : urls
}

const getVideoUrls = getFormatUrls('tbr')
const getAudioUrls = getFormatUrls('abr')

const getVideo = ({ formats }) =>
  getVideoUrls(formats, [hasAudio, isMp4, isHttps]) ||
  getVideoUrls(formats, [hasAudio, isMp4, isHttp]) ||
  getVideoUrls(formats, [isMp4, isHttps]) ||
  getVideoUrls(formats, [isMp4, isHttp]) ||
  getVideoUrls(formats, [isMp4])

const getAudio = ({ formats }) =>
  getAudioUrls(formats, [negate(hasVideo), isMp3, isHttps]) ||
  getAudioUrls(formats, [negate(hasVideo), isAac, isHttps]) ||
  getAudioUrls(formats, [negate(hasVideo), isM4a, isHttps]) ||
  getAudioUrls(formats, [negate(hasVideo), isMp3, isHttp]) ||
  getAudioUrls(formats, [negate(hasVideo), isAac, isHttp]) ||
  getAudioUrls(formats, [negate(hasVideo), isM4a, isHttp]) ||
  getAudioUrls(formats, [negate(hasVideo), isMp3]) ||
  getAudioUrls(formats, [negate(hasVideo), isAac]) ||
  getAudioUrls(formats, [negate(hasVideo), isM4a])

const getAuthor = ({ uploader, creator, uploader_id: uploaderId }) => {
  const author = find(
    [creator, uploader, uploaderId],
    str => isString(str) && !isUrl(str, { relative: false })
  )
  return author && titleize(author, { removeBy: true })
}

const getPublisher = ({ extractor_key: extractorKey }) =>
  isString(extractorKey) && extractorKey

const getTitle = ({ title: mainTitle, alt_title: secondaryTitle }) => {
  const title = find([mainTitle, secondaryTitle], isString)
  return title && titleize(title)
}

const getDate = ({ timestamp }) =>
  timestamp && new Date(timestamp * 1000).toISOString()

module.exports = () => {
  return {
    video: async ({ url }) => getVideo(await getVideoInfo(url)),
    audio: async ({ url }) => getAudio(await getVideoInfo(url)),
    author: async ({ url }) => getAuthor(await getVideoInfo(url)),
    publisher: async ({ url }) => getPublisher(await getVideoInfo(url)),
    title: async ({ url }) => getTitle(await getVideoInfo(url)),
    date: async ({ url }) => getDate(await getVideoInfo(url))
  }
}

module.exports.getFormatUrls = getFormatUrls
module.exports.getVideo = getVideo
module.exports.getAudio = getAudio
module.exports.getAuthor = getAuthor
module.exports.getPublisher = getPublisher
module.exports.getTitle = getTitle
module.exports.getDate = getDate
