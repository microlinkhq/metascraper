'use strict'

const { isTwitterUrl, getTwitterVideoInfo } = require('./twitter-video-info')
const createGetVideoInfo = require('./video-info')

const { protocol } = require('@metascraper/helpers')
const { chain } = require('lodash')

// Local cache for successive calls
let cachedVideoInfoUrl
let cachedVideoInfo

module.exports = opts => {
  const getVideoInfo = createGetVideoInfo(opts)

  const getInfo = async url => {
    if (!isTwitterUrl(url)) return getVideoInfo(url)

    const [videoInfo, twitterVideos] = await Promise.all([
      getVideoInfo(url),
      getTwitterVideoInfo(url)
    ])

    const formats = chain(videoInfo.formats)
      .reduce((acc, format, index) => {
        const { url } = twitterVideos[index]
        const item = { ...format, url, protocol: protocol(url) }
        return [...acc, item]
      }, [])
      .value()

    return { ...videoInfo, formats }
  }

  return async url => {
    if (url === cachedVideoInfoUrl) return cachedVideoInfo
    cachedVideoInfoUrl = url

    try {
      cachedVideoInfo = await getInfo(url)
    } catch (err) {
      cachedVideoInfo = {}
    }
    return cachedVideoInfo
  }
}
