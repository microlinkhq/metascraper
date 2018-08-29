'use strict'

const {
  overEvery,
  isEmpty,
  eq,
  has,
  get,
  chain,
  find,
  isString
} = require('lodash')
const { isUrl, titleize } = require('@metascraper/helpers')
const path = require('path')

const getVideoInfo = require('./get-video-info')

const isMp4 = video =>
  eq(get(video, 'ext'), 'mp4') ||
  path.extname(get(video, 'url')).startsWith('.mp4')
const isHttp = video => eq(get(video, 'protocol'), 'http')
const isHttps = video => eq(get(video, 'protocol'), 'https')
const hasAudio = video => has(video, 'abr')

const getVideoUrls = (videos, filters = []) => {
  const urls = chain(videos)
    .filter(overEvery(filters))
    .orderBy('tbr', 'asc')
    .map('url')
    .value()

  return isEmpty(urls) ? false : urls
}

const getVideoProvider = async ({ url }) => {
  const { formats } = await getVideoInfo(url)

  const videoUrl =
    getVideoUrls(formats, [isMp4, isHttps, hasAudio]) ||
    getVideoUrls(formats, [isMp4, isHttp, hasAudio]) ||
    getVideoUrls(formats, [isMp4, isHttps]) ||
    getVideoUrls(formats, [isMp4])

  return isUrl(videoUrl) && videoUrl
}

/**
 * Get the Author of the video.
 */
const getVideoAuthor = async ({ url }) => {
  const { uploader, creator, uploader_id: uploaderId } = await getVideoInfo(url)
  const author = find(
    [creator, uploader, uploaderId],
    str => isString(str) && !isUrl(str, { relative: false })
  )
  return author && titleize(author, { removeBy: true })
}

const getVideoPublisher = async ({ url }) => {
  const { extractor_key: extractorKey } = await getVideoInfo(url)
  return isString(extractorKey) && extractorKey
}

const getVideoTitle = async ({ url }) => {
  const { title: mainTitle, alt_title: secondaryTitle } = await getVideoInfo(
    url
  )
  const title = find([mainTitle, secondaryTitle], isString)
  return title && titleize(title)
}

const getVideoDate = async ({ url }) => {
  const { timestamp } = await getVideoInfo(url)
  return timestamp && new Date(timestamp * 1000).toISOString()
}

module.exports = () => {
  return {
    video: getVideoProvider,
    author: getVideoAuthor,
    publisher: getVideoPublisher,
    title: getVideoTitle,
    date: getVideoDate
  }
}

module.exports.getVideoUrls = getVideoUrls
module.exports.isMp4 = isMp4
module.exports.isHttp = isHttp
module.exports.isHttps = isHttps
module.exports.hasAudio = hasAudio
