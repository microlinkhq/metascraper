'use strict'

const { protocol } = require('@metascraper/helpers')
const { isEmpty, reduce } = require('lodash')

const { isTwitterUrl, getTwitterInfo } = require('./twitter-info')
const createGetMedia = require('./get-media')

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

    if (isEmpty(twitterVideos)) return videoInfo

    const formats = reduce(
      videoInfo.formats,
      (acc, format, index) => {
        const { url } = twitterVideos[index]
        const item = {
          ...format,
          url,
          protocol: protocol(url),
          extractor_key: 'Twitter'
        }
        return [...acc, item]
      },
      []
    )

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
