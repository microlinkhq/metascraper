'use strict'

const {
  overEvery,
  isEmpty,
  eq,
  has,
  round,
  size,
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

/**
 * Get a Video source quality enough good
 * compatible to be consumed for the browser.
 */
const getVideoUrl = (videos, filters = []) => {
  const urls = chain(videos)
    .filter(overEvery(filters))
    .map('url')
    .value()

  if (isEmpty(urls)) return false
  const index = round(size(urls) / 2) - 1
  return get(urls, index)
}

/**
 * Get a URL-like video source
 */
const getVideoProvider = async ({ url }) => {
  const { formats } = await getVideoInfo(url)

  const videoUrl =
    getVideoUrl(formats, [isMp4, isHttps, hasAudio]) ||
    getVideoUrl(formats, [isMp4, isHttp, hasAudio]) ||
    getVideoUrl(formats, [isMp4, isHttps]) ||
    getVideoUrl(formats, [isMp4])

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

module.exports.getVideoUrl = getVideoUrl
module.exports.isMp4 = isMp4
module.exports.isHttp = isHttp
module.exports.isHttps = isHttps
module.exports.hasAudio = hasAudio
