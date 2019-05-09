'use strict'

const { get, reduce, set } = require('lodash')
const memoizeOne = require('memoize-one')

const { createTwitterInfo, isTwitterUrl } = require('./twitter-info')
const { protocol } = require('@metascraper/helpers')
const createGetMedia = require('./get-media')

module.exports = ({ cache, cacheDir, userAgent, onError, proxies }) => {
  const getMedia = createGetMedia({ cacheDir, userAgent, onError })
  const getTwitterInfo = createTwitterInfo({
    cache,
    userAgent,
    proxies
  })

  const getInfo = async url => {
    if (!isTwitterUrl(url)) return getMedia(url)

    const [videoInfo, twitterVideos] = await Promise.all([getMedia(url), getTwitterInfo(url)])

    const { formats: twitterVideoFormats, ...twitterVideosData } = twitterVideos

    const formats = reduce(
      twitterVideoFormats,
      (acc, twitterVideo, index) => {
        const { url } = twitterVideo
        const format = get(acc, index, {})
        set(acc, index, { ...format, url, protocol: protocol(url) })
        return acc
      },
      get(videoInfo, 'formats')
    )

    return { ...videoInfo, ...twitterVideosData, formats }
  }

  return memoizeOne(getInfo)
}
