'use strict'

const { isTwitterUrl, getTwitterInfo } = require('./twitter-info')
const createGetMedia = require('./get-media')

const { protocol } = require('@metascraper/helpers')
const { chain } = require('lodash')

// Local cache for successive calls
let cachedVideoInfoUrl
let cachedVideoInfo

module.exports = opts => {
  const getMedia = createGetMedia(opts)

  const getInfo = async url => {
    if (!isTwitterUrl(url)) return getMedia(url)

    const [videoInfo, twitterVideos] = await Promise.all([
      getMedia(url),
      getTwitterInfo(url)
    ])

    const formats = chain(videoInfo.formats)
      .reduce((acc, format, index) => {
        const { url } = twitterVideos[index]
        const item = {
          ...format,
          url,
          protocol: protocol(url),
          extractor_key: 'Twitter'
        }
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
