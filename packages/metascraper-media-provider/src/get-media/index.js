'use strict'

const { protocol } = require('@metascraper/helpers')
const { isEmpty, reduce } = require('lodash')
const memoizeOne = require('memoize-one')

const { isTwitterUrl, getTwitterInfo } = require('./twitter-info')
const createGetMedia = require('./get-media')

module.exports = opts => {
  const getMedia = createGetMedia(opts)

  const getInfo = async url => {
    if (!isTwitterUrl(url)) return getMedia(url)

    const [videoInfo, twitterVideos] = await Promise.all([
      getMedia(url),
      getTwitterInfo(url)
    ])

    const twitterVideo = { ...videoInfo, extractor_key: 'Twitter' }

    if (isEmpty(twitterVideos)) return twitterVideo

    const formats = reduce(
      videoInfo.formats,
      (acc, format, index) => {
        const { url } = twitterVideos[index]
        const item = { ...format, url, protocol: protocol(url) }
        return [...acc, item]
      },
      []
    )

    return { ...twitterVideo, formats }
  }

  return memoizeOne(getInfo)
}
