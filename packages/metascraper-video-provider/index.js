'use strict'

const getSocialVideoUrl = require('get-social-video-url')
const { isUrl } = require('@metascraper/helpers')
const createBrowserless = require('browserless')

const PREFERRED_VIDEO_QUALITY = [
  'sd',
  'hd',
  'mobile'
]

const getVideoUrl = async ({
  browserless,
  url,
  preferredVideoQuality = PREFERRED_VIDEO_QUALITY
}) => {
  const videoQualities = await getSocialVideoUrl({ url, browserless })
  const videoQuality = preferredVideoQuality.find(videoQuality => isUrl(videoQualities[videoQuality]))
  return videoQualities[videoQuality]
}

module.exports = (opts = {}) => {
  const { launchOpts = {}, preferredVideoQuality } = opts

  const fn = async ({url}) => {
    const browserless = await createBrowserless(launchOpts)
    const result = await getVideoUrl({url, browserless, preferredVideoQuality})
    const browserInstance = await browserless.browser
    await browserInstance.close()
    return result
  }

  return { video: fn }
}

module.exports.getVideoUrl = getVideoUrl
