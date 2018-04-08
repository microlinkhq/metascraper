'use strict'

const { isUrl } = require('@metascraper/helpers')
const youtubedl = require('youtube-dl')
const { promisify } = require('util')
const path = require('path')

const getVideoInfo = promisify(youtubedl.getInfo)

/**
 * Get a Video source quality not too high
 */
const getVideoUrl = ({formats}) => {
  const urls = formats
    .map(item => item.url)
    .filter(url => path.extname(url).startsWith('.mp4'))

  const index = Math.round(urls.length / 2) - 1
  return urls[index]
}

const getVideoProvider = async url => {
  try {
    const info = await getVideoInfo(url)
    const videoUrl = getVideoUrl(info)
    return isUrl(videoUrl) && videoUrl
  } catch (err) {
    return false
  }
}

module.exports = () => {
  return {
    video: ({url}) => getVideoProvider(url)
  }
}

module.exports.getVideoUrl = getVideoUrl
