'use strict'

const { isEmpty, reduce, set } = require('lodash')
const { protocol } = require('@metascraper/helpers')
const memoizeOne = require('memoize-one')

const createTwitterInfo = require('./twitter-info')
const createGetMedia = require('./get-media')

module.exports = opts => {
  const getMedia = createGetMedia(opts)
  const { isTwitterUrl, getTwitterInfo } = createTwitterInfo(opts)

  const getInfo = async url => {
    if (!isTwitterUrl(url)) return getMedia(url)

    const [videoInfo, twitterVideos] = await Promise.all([
      getMedia(url),
      getTwitterInfo(url)
    ])

    const twitterVideo = { ...videoInfo, extractor_key: 'Twitter' }

    if (isEmpty(twitterVideos)) return twitterVideo

    const formats = reduce(
      twitterVideos,
      (acc, twitterVideo, index) => {
        const { url } = twitterVideo
        set(acc, index, { ...acc[index], url, protocol: protocol(url) })
        return acc
      },
      videoInfo.formats
    )
    return { ...twitterVideo, formats }
  }

  return memoizeOne(getInfo)
}
