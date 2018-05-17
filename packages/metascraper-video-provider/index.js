'use strict'

const { round, size, get, chain, find, isString } = require('lodash')
const {path: youtubeDlPath} = require('youtube-dl-installer')
const { isUrl, titleize } = require('@metascraper/helpers')
const parseDomain = require('parse-domain')
const { promisify } = require('util')
const path = require('path')

const execFile = promisify(require('child_process').execFile)

const providers = require('./providers')

const getInfo = async url => {
  const args = [ '--dump-json', '-f', 'best', url ]
  const {stdout, stderr} = await execFile(youtubeDlPath, args)
  return stderr === '' ? JSON.parse(stdout) : {}
}

const isSupportedProvided = url => providers.includes(parseDomain(url).domain)

let cachedVideoInfoUrl
let cachedVideoInfo

/**
 * Get the video info.
 * Avoid do more one request for the same URL.
 */
const getVideoInfo = async url => {
  if (!isSupportedProvided(url)) return {}
  if (url === cachedVideoInfoUrl) return cachedVideoInfo
  const info = await getInfo(url)
  cachedVideoInfoUrl = url
  cachedVideoInfo = info
  return info
}

const isMp4 = format => format.ext === 'mp4' || path.extname(format.url).startsWith('.mp4')
const isHttp = format => format.protocol === 'https' || format.protocol === 'http'

/**
 * Get a Video source quality enough good
 * compatible to be consumed for the browser.
 */
const getVideoUrl = formats => {
  const urls = chain(formats)
    .filter(format => isHttp(format) && isMp4(format))
    .map('url')
    .value()

  const index = round(size(urls) / 2) - 1
  return get(urls, index)
}

/**
 * Get a URL-like video source.
 */
const getVideoProvider = async ({url}) => {
  const { formats } = await getVideoInfo(url)
  const videoUrl = getVideoUrl(formats)
  return isUrl(videoUrl) && videoUrl
}

/**
 * Get the Author of the video.
 */
const getVideoAuthor = async ({url}) => {
  const { uploader, creator, uploader_id: uploaderId } = await getVideoInfo(url)
  const author = find([creator, uploader, uploaderId], str => (
    isString(str) && !isUrl(str, {relative: false})
  ))
  return author && titleize(author, {removeBy: true})
}

const getVideoPublisher = async ({url}) => {
  const { extractor_key: extractorKey } = await getVideoInfo(url)
  return isString(extractorKey) && extractorKey
}

const getVideoTitle = async ({url}) => {
  const { title: mainTitle, alt_title: secondaryTitle } = await getVideoInfo(url)
  const title = find([mainTitle, secondaryTitle], isString)
  return title && titleize(title)
}

const getVideoDate = async ({url}) => {
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
