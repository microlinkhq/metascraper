'use strict'

const {isTwitterUrl, getTwitterVideoInfo} = require('./twitter-video-info')
const getVideoInfo = require('./video-info')
const { chain } = require('lodash')

const getInfo = async url => {
  if (!isTwitterUrl(url)) return getVideoInfo(url)

  const [videoInfo, twitterVideos] = await Promise.all([
    getVideoInfo(url),
    getTwitterVideoInfo(url)
  ])

  const formats = chain(videoInfo.formats)
    .reduce((acc, format, index) => {
      const { url } = twitterVideos[index]
      const item = {...format, url}
      return [...acc, item]
    }, [])
    .value()

  return {...videoInfo, formats}
}

// Local cache for successive calls
let cachedVideoInfoUrl
let cachedVideoInfo

module.exports = async url => {
  if (url === cachedVideoInfoUrl) return cachedVideoInfo
  cachedVideoInfoUrl = url

  try {
    cachedVideoInfo = await getInfo(url)
  } catch (err) {
    cachedVideoInfo = {}
  }
  return cachedVideoInfo
}
