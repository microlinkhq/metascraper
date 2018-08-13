'use strict'

const { overEvery, isEmpty, eq, has, round, size, get, chain, find, isString } = require('lodash')
const { isUrl, titleize } = require('@metascraper/helpers')
const youtubedl = require('youtube-dl')
const { promisify } = require('util')
const path = require('path')

const getInfo = promisify(youtubedl.getInfo)

let cachedVideoInfoUrl
let cachedVideoInfo

/**
 * Get the video info.
 * Avoid do more one request for the same URL.
 */
const getVideoInfo = async url => {
  if (url === cachedVideoInfoUrl) return cachedVideoInfo
  cachedVideoInfoUrl = url

  try {
    cachedVideoInfo = await getInfo(url)
  } catch (err) {
    cachedVideoInfo = {}
  }

  return cachedVideoInfo
}

const isMp4 = format => eq(get(format, 'ext'), 'mp4') || path.extname(get(format, 'url')).startsWith('.mp4')
const isHttp = format => eq(get(format, 'protocol'), 'http')
const isHttps = format => eq(get(format, 'protocol'), 'https')
const hasAudio = format => has(format, 'abr')

/**
 * Get a Video source quality enough good
 * compatible to be consumed for the browser.
 */
const getVideoUrl = (formats, filters = []) => {
  const urls = chain(formats)
    .filter(overEvery(filters))
    .map('url')
    .value()

  if (isEmpty(urls)) return false
  const index = round(size(urls) / 2) - 1
  return get(urls, index)
}

/**
 * Get a URL-like video source.
 */
const getVideoProvider = async ({ url }) => {
  const { formats } = await getVideoInfo(url)
  const videoUrl = getVideoUrl(formats, [isMp4, isHttps, hasAudio]) ||
    getVideoUrl(formats, [isMp4, isHttp, hasAudio]) ||
    getVideoUrl(formats, [isMp4, isHttps]) ||
    getVideoUrl(formats, [isMp4]) ||
    getVideoUrl(formats)

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
  const { title: mainTitle, alt_title: secondaryTitle } = await getVideoInfo(url)
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
